class EmailService {
    constructor(fromAddress) {
        this.from = fromAddress;
        this.sgMail = require('@sendgrid/mail');
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async send(to, templateId, templateData, text, html, subject, from = this.from) {
        const msg = {
            to: to,
            from: from,
        };

        if (subject) {
            msg.subject = subject;
        }
        if (templateId) {
            msg.templateId = templateId;
            if (templateData) {
                msg.dynamicTemplateData = templateData;
            }
        } else {
            if (text) {
                msg.text = text;
            }
            if (html) {
                msg.html = html;
            }
        }

        try {
            const sent = await this.sgMail.send(msg);
            console.log('sent', sent);
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendClientCreate(to, clientId, clientName) {
        const templateId = process.env.SENDGRID_CLIENT_SIGNUP_TEMPLATE_ID;
        const templateData = {
            clientId,
            clientName,
        };
        return this.send(to, templateId, templateData);
    }

    async sendInviteeSignUp(to, userPublicId, itemName, regLink) {
        const link = `${regLink}${userPublicId}`;
        const templateId = process.env.SENDGRID_INVITEE_TEMPLATE_ID;
        const templateData = {
            itemName,
            link,
        };
        return this.send(to, templateId, templateData);
    }

    async sendPasswordlessLoginLink(to, username, firstName, lastName, password, itemName, loginLink) {
        let greeting = 'Hi';
        if (firstName) {
            greeting = `${greeting} ${firstName}`;
        }
        if (lastName) {
            greeting = `${greeting} ${lastName}`;
        }
        const link = `${loginLink}?username=${username}&token=${password}`;
        const templateId = process.env.SENDGRID_PASSWORDLESS_LOGIN_LINK_TEMPLATE_ID;
        const templateData = {
            itemName,
            greeting,
            link
        };
        return this.send(to, templateId, templateData);
    }

}

module.exports = new EmailService(process.env.EXTREAM_FROM_ADDESS);
