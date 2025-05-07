const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
exports.handler = async (event) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('katas')
      .select('*')
      .gte('fecha_inicio', today);

    if (error) {
      return {
        statusCode: 500,
        body: { error: 'Error al consultar las katas', detalle: error.message },
      };
    }

    return {
      statusCode: 200,
      body:(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: { error: 'Error interno del servidor', detalle: err.message },
    };
  }
};

