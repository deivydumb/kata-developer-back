const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const body = typeof event === 'string' ? JSON.parse(event) : event;
    console.log('Received body:', body);
    if (
      !body || 
      Object.keys(body).length === 0 || 
      !body.email || 
      !body.password
    ) {
      return {
        statusCode: 400,
        body:({ error: 'Email y contraseña son requeridos' }),
      };
    }
    const { email, password } = body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return {
        statusCode: 401,
        body:({ error: 'Credenciales incorrectas' }),
      };
    }
    const { password: _, ...safeUser } = user;
    return {
      statusCode: 200,
      body: ({ message: 'Autenticación exitosa', user: safeUser }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: ({ error: 'Error interno del servidor', detalle: err.message }),
    };
  }
};
