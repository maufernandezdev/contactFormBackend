const express = require('express');
const contactRoute = express.Router();
contactRoute.use(express.json());
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();
const path = require('path');

contactRoute.post('/' , (req, res) => {
    
    const { name, email , message} = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const contentHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>email</title>
    </head>
    <body style="display: flex; justify-content: center;">
        <section style='display: flex; justify-content: center; width:100%; font-family: "Roboto", sans-serif;'>
            <div style="background-color: #fff; padding:1.5em; width:550px; text-align:center; color:#142032; margin:0px auto;border: 1px solid #ccc;">
                <p style="font-size: 1.2em">¡Hola <span style="font-weight: 700;">${name}</span>!</p> 
                <p style="font-size: 1em">¡Gracias por tu mensaje! <span style='font-size:17px;'>&#128588;</span></p>
                <img style="width: 150px; margin: 1em;" src="cid:email"/>
                <p style="font-size: 1em">Recibiras mi respuesta pronto!</p>
                <p style="font-size: 1em">¡Saludos! <span style='font-size:17px;'>&#128640;</span></p>
                <p style="font-weight: 550; font-size: 1.1em; margin-top: 2.5em;">Mauricio Fernandez <br>Front End Software Developer</p>
            </div>
        </section>
    </body>
    </html>
    `;

    const contentHTMLToAdminEmail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>email</title>
    </head>
    <body>
        <section class="email-container">
            <div class="email-content">
                <h1 class="email-title">Mensaje nuevo de sitio web perosnal</h1>
                <ul>
                    <li>sender: ${name} </li>
                    <li>email: ${email} </li>
                    <li>message: ${message} </li>
                </ul>
            </div>
        </section>
    </body>
    </html>
    `;

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const CLIENT_REDIRECT_URI = process.env.CLIENT_REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,CLIENT_REDIRECT_URI);
    oAuth2Client.setCredentials({
        refresh_token : REFRESH_TOKEN
        
    });

    const getAccessToken = async () =>
    {   
        try
        {
            const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
            return ACCESS_TOKEN;
        }
        catch(error)
        {
            res.send({result:'access token error', error: error});
        }
    }

    const ACCESS_TOKEN  = getAccessToken();
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            type: "OAuth2",
            user: process.env.SENDER_EMAIL,
            clientId: CLIENT_ID,
            clientSecret : CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: ACCESS_TOKEN,
        }
    });

    const sendEmail = async (mailOptions) =>
    {   
        try
        {
            const result = await transporter.sendMail(mailOptions);
            return result;
        }
        catch(error)
        {   
            return res.send({result: 'error send email', error: error, path: __dirname});
        }
    }

    const getEmailOptions = (email, contentHTML) =>
    {   
        return {

            from: "Mauricio Fernandez Software Developer <maufernadezdev>",
            to: email,
            subject:"Mauricio Fernandez sitio web 🤓",
            html: contentHTML,
            attachments:
            [
                {
                    filename: 'email.png',
                    path: path.join(__dirname, '../public/images/email.png'),
                    cid: 'email'
                }
            ]
        }
    };

    const sendResponse = (userResponse,adminResponse) =>
    {   
        if(userResponse.rejected.length === 0 && adminResponse.rejected.length === 0)
        {
            return res.send({result: 'send'});
        }
        else
        {
            return res.send({result: 'error send response'});
        }
    }

    const sendingEmail = async (options) =>
    {
        try
        {
            const userResponse = await sendEmail(options);
            const adminOptions = getEmailOptions(adminEmail, contentHTMLToAdminEmail);
            const adminResponse = await sendEmail(adminOptions);
            sendResponse(userResponse,adminResponse);
            
        }
        catch(error)
        {
            return res.send({result: 'error sending email', error: error});
        }
    }

    const userOptions = getEmailOptions(email, contentHTML);
    sendingEmail(userOptions);
});


module.exports = contactRoute;