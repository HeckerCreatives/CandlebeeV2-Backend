module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'd8b36eeacb83a28ca6369182c88af5d3'),
    },
  },
  cron: {
    enabled: true,
  },
  CUSTOMENV: {
    FRONT_END_URL: env('FRONT_END_URL')
  }
});
