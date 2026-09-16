import nodemailer from 'nodemailer';

export async function POST(request) {
    const { to, subject, text, html } = await request.json()
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  //smtp.gmail.com
        port: 465,
        secure: true,
        auth: {
            user: process.env.NEXT_PUBLIC_SMTP_MAIL,
            pass: process.env.NEXT_PUBLIC_SMTP_PASS,
        }
    });

    const mailOptions = {
        from: `${process.env.NEXT_PUBLIC_SMTP_MAIL}`,
        to,
        subject,
        html,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return Response.json({ error: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return Response.json({ error: 'Error sending email' }, { status: 500 });
    }
}
