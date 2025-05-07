const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const kataId = event.queryStringParameters?.kata_id;
    if (!kataId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "kata_id es requerido" }),
      };
    } 

    const { data, error } = await supabase
    .from('evaluaciones')
    .select(`
      id,
      innovacion,
      conocimiento,
      liderazgo,
      comentario,
      participaciones (
        id,
        user:user_id (
          nombre
        ),
        kata:katas_id (
          id,
          nombre
        )
      )
    `)
    .eq('participaciones.katas_id', kataId);

    if (error) {
      throw error;
    }
    console.log("Data:", data);
    const resultados = data
    .filter((eval) => eval.participaciones && eval.participaciones.user && eval.participaciones.kata)
    .map((eval) => ({
      user_id: eval.participaciones.user_id,
      nombre_usuario: eval.participaciones.user.nombre,
      kata_nombre: eval.participaciones.kata.nombre,
      comentario: eval.comentario,
      ponderado: Number(
        ((eval.innovacion + eval.conocimiento + eval.liderazgo) / 3).toFixed(2)
      ),
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(resultados),
    };

  } catch (err) {
    console.error("Error en Lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
