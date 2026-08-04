FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/arsenal-tracker-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dsun.net.inetaddr.ttl=60", "-jar", "app.jar"]