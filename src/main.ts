import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function start() {
  try {
    const PORT = process.env.PORT || 3003;
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );

    app.use(cookieParser());

    app.enableCors({
      origin: "http://localhost:5173",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true,
      allowedHeaders: "Content-Type, Accept, Authorization",
    });

    app.setGlobalPrefix("api");

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: "1",
    });

    const config = new DocumentBuilder()
      .setTitle("HMHY project")
      .setDescription("HMHY REST API")
      .setVersion("1.0")
      .addTag("imtixon")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "access-token"
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/v1", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.listen(PORT);

    console.log(`Server started at: http://localhost:${PORT}`);
  } catch (error) {
    console.error("Server ishga tushmadi:", error);
  }
}

start();
