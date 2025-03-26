import nodemailer from 'nodemailer';

// Configuración del transporte para el correo electrónico
let transporter: nodemailer.Transporter;

// Inicializar el transporte de correo electrónico
export function initEmailService() {
  // Para desarrollo, usamos ethereal.email que atrapa los correos y los muestra en una interfaz web
  // En producción, se usaría un servicio real como SendGrid, AWS SES, etc.
  if (process.env.NODE_ENV === 'production') {
    // Configuración para producción
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Boolean(process.env.EMAIL_SECURE) || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Configuración para desarrollo usando una cuenta de prueba de ethereal.email
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal_test_user',
        pass: process.env.EMAIL_PASSWORD || 'ethereal_test_password',
      },
    });
  }
}

// Función para enviar un correo electrónico
export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    if (!transporter) {
      initEmailService();
    }

    const { to, subject, text, html } = options;

    const message = {
      from: process.env.EMAIL_FROM || 'Origo CMS <origo@example.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(message);

    // En desarrollo, mostramos la URL donde se puede ver el correo (solo para ethereal.email)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Vista previa del correo electrónico: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
    throw error;
  }
}

// Plantilla para correo de invitación
export function generateInvitationEmail(options: {
  name: string;
  email: string;
  tempPassword: string;
  inviterName: string;
  organizationName: string;
  loginUrl: string;
}) {
  const { name, email, tempPassword, inviterName, organizationName, loginUrl } = options;

  const subject = `Invitación a unirse a ${organizationName} en Origo CMS`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333;">Bienvenido a Origo CMS</h1>
      </div>
      <p>Hola ${name},</p>
      <p>${inviterName} te ha invitado a unirte a <strong>${organizationName}</strong> en Origo CMS.</p>
      <p>Puedes acceder con las siguientes credenciales:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
      </div>
      <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Iniciar sesión</a>
      </div>
      <p>Si tienes alguna pregunta, no dudes en contactar con el administrador de tu organización.</p>
      <p>¡Gracias!</p>
      <p>El equipo de Origo CMS</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
    </div>
  `;

  const text = `
    Hola ${name},
    
    ${inviterName} te ha invitado a unirte a ${organizationName} en Origo CMS.
    
    Puedes acceder con las siguientes credenciales:
    Email: ${email}
    Contraseña temporal: ${tempPassword}
    
    Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.
    
    Inicia sesión en: ${loginUrl}
    
    Si tienes alguna pregunta, no dudes en contactar con el administrador de tu organización.
    
    ¡Gracias!
    El equipo de Origo CMS
  `;

  return { subject, html, text };
}

// Función específica para enviar invitación por correo electrónico
export async function sendInvitationEmail(options: {
  name: string;
  email: string;
  tempPassword: string;
  inviterName: string;
  organizationName: string;
  loginUrl?: string;
}) {
  const { name, email, tempPassword, inviterName, organizationName } = options;
  
  // URL de inicio de sesión predeterminada
  const loginUrl = options.loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth`;

  // Generar plantilla de correo
  const { subject, html, text } = generateInvitationEmail({
    name,
    email,
    tempPassword,
    inviterName,
    organizationName,
    loginUrl,
  });

  // Enviar el correo
  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

// Crear cuentas de prueba para desarrollo
export async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Cuenta de prueba de correo creada:');
    console.log('Usuario:', testAccount.user);
    console.log('Contraseña:', testAccount.pass);
    
    // Actualizar el transportador con las credenciales de prueba
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    return testAccount;
  } catch (error) {
    console.error('Error al crear cuenta de prueba de correo:', error);
    throw error;
  }
}

// Inicializa el servicio cuando se importa
initEmailService();