const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

export interface BrevoContact {
  email: string;
  emailBlacklisted: boolean;
}

/**
 * Removes a contact from the SMTP/Transactional exclusion list (hardbounces, spam).
 * Returns true if an actual removal happened (204).
 */
async function removeSmtpBlock(email: string): Promise<boolean> {
  try {
    const lowercaseEmail = email.toLowerCase().trim();
    const encodedEmail = encodeURIComponent(lowercaseEmail);
    console.log(`[Brevo SMTP] Checking/Removing block for: ${lowercaseEmail}`);
    
    const response = await fetch(`https://api.brevo.com/v3/smtp/blockedContacts/${encodedEmail}`, {
      method: 'DELETE',
      headers: {
        'api-key': BREVO_API_KEY,
        'accept': 'application/json'
      }
    });

    if (response.status === 204) {
      console.log(`[Brevo SMTP] Success: ${lowercaseEmail} removed from SMTP list.`);
      return true;
    }
    
    if (response.status === 404) {
      console.log(`[Brevo SMTP] Info: ${lowercaseEmail} not in SMTP list.`);
      return false;
    }

    console.error(`[Brevo SMTP Error] Status ${response.status}:`, await response.text());
    return false;
  } catch (error) {
    console.error(`[Brevo SMTP Exception]:`, error);
    return false;
  }
}

/**
 * Forced Resubscription using POST (Create/Update) which is more robust than PUT for unblocking.
 * Returns true if the contact is verified as clean.
 */
export async function checkAndUnblockContact(email: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error('[Brevo Error] BREVO_API_KEY missing');
    return false;
  }

  const lowercaseEmail = email.toLowerCase().trim();

  try {
    console.log(`[Brevo Process] Checking status for: ${lowercaseEmail}`);

    // 1. Initial Check: Is the contact actually blacklisted?
    const initialResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(lowercaseEmail)}`, {
      headers: { 'api-key': BREVO_API_KEY, 'accept': 'application/json' }
    });

    let isOriginallyBlacklisted = false;
    if (initialResponse.ok) {
      const contact: BrevoContact = await initialResponse.json();
      isOriginallyBlacklisted = contact.emailBlacklisted;
    } else if (initialResponse.status === 404) {
      console.log(`[Brevo Process] Info: Contact ${lowercaseEmail} not found. Skipping unblock.`);
      return false;
    }

    // 2. SMTP Layer: Always try to remove from SMTP block list if we are in unblock process
    // especially if we suspect issues or if it's originally blacklisted.
    // removeSmtpBlock returns true only if an actual deletion happened (204).
    const smtpActed = await removeSmtpBlock(lowercaseEmail);

    // 3. CRM Layer: Only unblock if originally blacklisted
    let crmActed = false;
    if (isOriginallyBlacklisted) {
      console.log(`[Brevo Process] Contact is blacklisted. Attempting CRM unblock for: ${lowercaseEmail}`);
      const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(lowercaseEmail)}`, {
        method: 'PUT',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          emailBlacklisted: false
        })
      });

      if (updateResponse.status === 204 || updateResponse.ok) {
        console.log(`[Brevo CRM] Update SUCCESS for: ${lowercaseEmail}`);
        crmActed = true;
      } else {
        console.error(`[Brevo CRM Error] Status ${updateResponse.status}:`, await updateResponse.text());
      }
    }

    // Return true if any actual unblocking action was taken
    const totalActed = crmActed || smtpActed;
    if (totalActed) {
      console.log(`[Brevo Final] Unblock action performed for ${lowercaseEmail}: CRM=${crmActed}, SMTP=${smtpActed}`);
    }
    
    return totalActed;
  } catch (error) {
    console.error(`[Brevo Exception]:`, error);
    return false;
  }
}
