import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var postgres: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL!;
const sql = globalThis.postgres || postgres(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalThis.postgres = sql;
}

export default sql;
