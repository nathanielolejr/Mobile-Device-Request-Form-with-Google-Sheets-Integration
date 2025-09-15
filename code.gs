function doGet() {
  return HtmlService.createHtmlOutputFromFile('form'); // Loads the form
}

function processForm(data) {
  try {
    // Open the Google Sheet by ID
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID_HERE').getActiveSheet();

    // Prepare the data to append
    const rowData = [
      data.name,
      data.email,
      data['user-type'],
      data['phone-ownership'],
      data['phone-brand'],
      data['phone-model'],
      data['last-phone-model'] || 'N/A' // Use 'N/A' if the field is empty
    ];

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Send email after saving data
    sendEmail();

    return 'Form submitted successfully! Email sent.';
  } catch (error) {
    return 'Error: ' + error.toString();
  }
}

function sendEmail() {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID_HERE').getActiveSheet();
    const lastRow = sheet.getLastRow(); // Get the last row
    const data = sheet.getRange(lastRow, 1, 1, 7).getValues()[0]; // Fetch data from the last row

    Logger.log("Last row data: " + JSON.stringify(data));

    const labels = ["Name", "Email", "User Type", "Ownership", "Brand", "Model", "Old Model"];
    let emailData = {};
    for (let i = 0; i < labels.length; i++) {
      emailData[labels[i]] = data[i] || "N/A";
    }

    const recipient = "recipient@example.com";
    const ccRecipient = "cc@example.com"; // CC recipient

    const emailConfigs = [
      {
        subject: "Request - Type A",
        heading: "Request Details",
        intro: "A new request has been submitted. Below are the details for review."
      },
      {
        subject: "Request - Type B",
        heading: "Additional Request",
        intro: "Another request has been submitted. Below are the details for review."
      }
    ];

    emailConfigs.forEach(config => {
      const template = HtmlService.createTemplateFromFile('email');
      template.data = emailData;
      template.heading = config.heading;
      template.intro = config.intro;
      const emailContent = template.evaluate().getContent();

      MailApp.sendEmail({
        to: recipient,
        cc: ccRecipient,
        subject: config.subject,
        body: config.intro + "\n\n(This email contains HTML content)",
        htmlBody: emailContent
      });
    });

    return "Emails sent successfully!";
  } catch (error) {
    return "Error: " + error.toString();
  }
}
