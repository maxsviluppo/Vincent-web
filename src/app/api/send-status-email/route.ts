import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderEmail, customerEmail, customerName, orderId, status, trackingId, carrier } = body;

    if (!customerEmail || !orderId || !status) {
      return NextResponse.json(
        { error: 'Parametri mancanti (customerEmail, orderId, status)' },
        { status: 400 }
      );
    }

    const effectiveSender = senderEmail || 'info@vincentabbigliamento.it';

    // Traduzione dello stato in italiano
    let statusLabel = status;
    let description = '';
    switch (status) {
      case 'pending':
        statusLabel = 'IN ATTESA';
        description = 'Il tuo ordine è stato ricevuto ed è in attesa di essere elaborato.';
        break;
      case 'shipped':
        statusLabel = 'SPEDITO';
        description = `Il tuo ordine è stato affidato al corriere ${carrier || 'espresso'}.${
          trackingId ? ` Codice di tracciamento: ${trackingId}` : ''
        }`;
        break;
      case 'delivered':
        statusLabel = 'CONSEGNATO';
        description = 'Il tuo ordine è stato consegnato con successo. Grazie per aver acquistato su Vincent Store!';
        break;
      case 'refunded':
        statusLabel = 'RIMBORSATO';
        description = 'È stato emesso un rimborso per il tuo ordine.';
        break;
      case 'cancelled':
        statusLabel = 'ANNULLATO';
        description = 'Il tuo ordine è stato annullato.';
        break;
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #171717; border-radius: 10px; background-color: #ffffff;">
        <div style="background-color: #0a0a0a; padding: 18px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: #ffffff; letter-spacing: 0.25em; text-transform: uppercase; font-size: 20px;">VINCENT STORE</h1>
          <p style="margin: 4px 0 0 0; color: #a3a3a3; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;">Atelier & Boutique Napoli</p>
        </div>
        <div style="padding: 24px; color: #171717;">
          <h2 style="color: #0a0a0a; font-size: 18px;">Gentile ${customerName || 'Cliente'},</h2>
          <p>Ti informiamo che lo stato del tuo ordine <strong>#${orderId}</strong> è cambiato in: <span style="background-color: #0a0a0a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; letter-spacing: 0.05em;">${statusLabel}</span></p>
          <p style="line-height: 1.6; color: #525252; margin: 16px 0;">${description}</p>
          <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="font-size: 11px; color: #737373; line-height: 1.5;">Vincent Store · Corso San Giovanni a Teduccio 293, 80146 Napoli NA<br/>Email assistenza: info@vincentabbigliamento.it · Tel/WhatsApp: +39 331 342 4069</p>
        </div>
      </div>
    `;

    // Log dell'invio in console per simulare il mailer reale
    console.log('==================================================');
    console.log(`[EMAIL SIMULATOR] Invio email di notifica cambio stato`);
    console.log(`Da: ${effectiveSender}`);
    console.log(`A: ${customerEmail} (${customerName || 'Cliente'})`);
    console.log(`Oggetto: Aggiornamento Ordine #${orderId} - Stato: ${statusLabel}`);
    console.log(`Contenuto (HTML):\n${emailHtml}`);
    console.log('==================================================');

    return NextResponse.json({
      success: true,
      message: `Email inviata correttamente da ${effectiveSender} a ${customerEmail}`,
      simulated: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
