FROM eclipse-temurin:11-jre-alpine
WORKDIR /app
ARG JAR_FILE
COPY ${JAR_FILE} app.jar
ENV JAVA_OPTS="-XX:TieredStopAtLevel=1 -Xms32m -Xmx220m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
