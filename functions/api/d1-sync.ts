interface Env {
  DB: any;
}

export const onRequestGet = async (context: { env: Env }) => {
  try {
    if (!context.env.DB) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "D1 Database binding 'DB' not configured. Please bind D1 in Cloudflare Pages Settings -> Bindings.",
          isConfigured: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { results } = await context.env.DB.prepare(
      'SELECT key, value FROM office_data'
    ).all();

    const data: Record<string, any> = {};
    if (Array.isArray(results)) {
      for (const row of results as any[]) {
        try {
          data[row.key] = JSON.parse(row.value);
        } catch {
          data[row.key] = row.value;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, isConfigured: true, data }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'D1 Read failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  try {
    if (!context.env.DB) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "D1 Database binding 'DB' not configured.",
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await context.request.json()) as {
      key?: string;
      value?: any;
      batch?: Array<{ key: string; value: any }>;
    };

    // Support batch writes
    if (body.batch && Array.isArray(body.batch)) {
      const stmts = body.batch.map((item) => {
        const valueStr =
          typeof item.value === 'string'
            ? item.value
            : JSON.stringify(item.value);
        return context.env.DB.prepare(
          'INSERT OR REPLACE INTO office_data (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
        ).bind(item.key, valueStr);
      });

      await context.env.DB.batch(stmts);

      return new Response(
        JSON.stringify({
          success: true,
          count: body.batch.length,
          message: 'Batch saved to Cloudflare D1',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.key || body.value === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing key or value parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const valStr =
      typeof body.value === 'string' ? body.value : JSON.stringify(body.value);

    await context.env.DB.prepare(
      'INSERT OR REPLACE INTO office_data (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    )
      .bind(body.key, valStr)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Saved to Cloudflare D1' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'D1 Write failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
