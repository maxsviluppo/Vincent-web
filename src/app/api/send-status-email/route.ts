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

    const effectiveSender = senderEmail || 'noreply@bespoint.it';

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
        description = 'Il tuo ordine è stato consegnato con successo. Grazie per aver acquistato su BesPoint!';
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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="background-color: #ffd600; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: #0a0a0a; font-style: italic;">壓ESPOINT</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #0a0a0a;">Ciao ${customerName || 'Cliente'},</h2>
          <p>Ti informiamo che lo stato del tuo ordine <strong>#${orderId}</strong> è cambiato in: <span style="background-color: #0a0a0a; color: #ffd600; padding: 3px 8px; border-radius: 5px; font-weight: bold;">${statusLabel}</span></p>
          <p style="line-height: 1.6; color: #555;">${description}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Questa notifica ti è stata inviata da ${effectiveSender}. Per favore non rispondere a questa email.</p>
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
