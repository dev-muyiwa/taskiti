import * as process from 'node:process';
import { EnvConfig } from './validation.schema';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

export default (): EnvConfig => {
  const config = {
    app_name: process.env.APP_NAME,
    jwt: {
      access_secret: process.env.JWT_ACCESS_SECRET,
      refresh_secret: process.env.JWT_REFRESH_SECRET,
    },
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI,
    // redis: {
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    // },
    // email: {
    //   host: process.env.MAIL_HOST,
    //   port: process.env.MAIL_PORT,
    //   user: process.env.MAIL_USER,
    //   password: process.env.MAIL_PASSWORD,
    //   from: process.env.MAIL_FROM,
    //   secure: process.env.MAIL_TLS === 'yes' ? 'true' : 'false',
    // },
  };

  const configInstance = plainToInstance(EnvConfig, config);
  const errors = validateSync(configInstance, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    const formatValidationErrors = (
      errors: ValidationError[],
      parentPath: string = '',
    ): any[] => {
      return errors.flatMap((error: ValidationError) => {
        const currentPath = parentPath
          ? `${parentPath}.${error.property}`
          : error.property;

        const fieldErrors = Object.entries(error.constraints || {}).map(
          (message) => ({
            field: `${currentPath}`,
            message: message.pop(),
          }),
        );

        const nestedErrors = formatValidationErrors(
          error.children as ValidationError[],
          currentPath,
        );

        return [...fieldErrors, ...nestedErrors];
      });
    };
    const formattedErrors = formatValidationErrors(errors);
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(formattedErrors, null, 2),
    );
    process.exit(1);
  }

  return configInstance;
};
