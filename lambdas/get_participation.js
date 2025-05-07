const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
exports.handler = async (event) => {
  try {
    const kataId = event.queryStringParameters.katas_id
    const juradoId = event.queryStringParameters.jurado_id;

    if (!kataId || !juradoId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Debe enviar kata_id y jurado_id' }),
      };
    }

    // 1. Traer todas las participaciones de la kata
    const { data: participaciones, error: participacionesError } = await supabase
      .from('participaciones')
      .select(`
        id,
        user_id,
        users ( nombre, email, rol )
      `)
      .eq('katas_id', kataId);

    if (participacionesError) {
      throw participacionesError;
    }

    // 2. Filtrar las que NO han sido evaluadas por este jurado
    const { data: evaluadas, error: evaluadasError } = await supabase
      .from('evaluaciones')
      .select('participacion_id')
      .eq('jurado_id', juradoId);

    if (evaluadasError) {
      throw evaluadasError;
    }

    const evaluadasIds = new Set(evaluadas.map(e => e.participacion_id));

    const noEvaluadas = participaciones.filter(p => !evaluadasIds.has(p.id));

    const resultado = noEvaluadas.map(p => ({
      participacion_id: p.id,
      user_id: p.user_id,
      nombre: p.users?.nombre,
      email: p.users?.email,
      rol: p.users?.rol
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(resultado),
    };

  } catch (err) {
    console.error('Error general:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};
