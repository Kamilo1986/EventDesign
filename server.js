// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();    // Cargar variables de entorno

const app = express();
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
const PORT = process.env.PORT || 5000;
console.log("Conexión a MySQL establecida ✅");

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando ✅");
});

// Endpoint POST para recibir formulario
app.post("/api/contact", async (req, res) => {
  const { nombre, email, telefono, tipoEvento, cantidad, descripcion } = req.body;

  try {
    // Guardar en la base de datos
    await db.execute(
      `INSERT INTO contactos (nombre, email, telefono, tipo_evento, cantidad_personas, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, telefono, tipoEvento, cantidad, descripcion]
    );

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true si usas puerto 465
      auth: {
        user: "capitanmeseros2017@gmail.com", // tu correo
        pass: "meev eiop ialu qfvv",              // contraseña de aplicación Gmail
      },
    });

    // Enviar correo
    await transporter.sendMail({
      from: '"Event Design" <capitanmeseros2017@gmail.com>',
      to: "capitanmeseros2017@gmail.com", // correo donde recibirás los formularios
      replyTo:email, 
      subject: "Nueva solicitud de cotización es una prueba",
      html: `
        <h2>Solicitud de Cotización</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Tipo de Evento:</strong> ${tipoEvento}</p>
        <p><strong>Cantidad de personas:</strong> ${cantidad}</p>
        <p><strong>Descripción:</strong> ${descripcion}</p>
      `,
    });

    res.json({ success: true, message: "Solicitud enviada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al enviar solicitud" });
  }
});

// Levantar el servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
