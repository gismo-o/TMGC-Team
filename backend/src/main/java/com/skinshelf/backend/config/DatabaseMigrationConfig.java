package com.skinshelf.backend.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class DatabaseMigrationConfig {

    @Bean
    static BeanFactoryPostProcessor entityManagerFactoryDependsOnDatabaseMigration() {
        return beanFactory -> {
            if (!beanFactory.containsBeanDefinition("entityManagerFactory")) {
                return;
            }

            BeanDefinition beanDefinition = beanFactory.getBeanDefinition("entityManagerFactory");
            Set<String> dependsOn = new LinkedHashSet<>();
            String[] existingDependencies = beanDefinition.getDependsOn();
            if (existingDependencies != null) {
                dependsOn.addAll(Arrays.asList(existingDependencies));
            }
            dependsOn.add("databaseMigration");
            beanDefinition.setDependsOn(dependsOn.toArray(String[]::new));
        };
    }

    @Bean("databaseMigration")
    public Object databaseMigration(
            DataSource dataSource,
            @Value("${spring.flyway.enabled:true}") boolean enabled,
            @Value("${spring.flyway.locations:classpath:db/migration}") String locations,
            @Value("${spring.flyway.baseline-on-migrate:true}") boolean baselineOnMigrate,
            @Value("${spring.flyway.baseline-version:0}") String baselineVersion
    ) {
        if (!enabled) {
            return new Object();
        }

        Flyway.configure()
                .dataSource(dataSource)
                .locations(parseLocations(locations))
                .baselineOnMigrate(baselineOnMigrate)
                .baselineVersion(MigrationVersion.fromVersion(baselineVersion))
                .load()
                .migrate();

        return new Object();
    }

    private String[] parseLocations(String locations) {
        return Arrays.stream(locations.split(","))
                .map(String::trim)
                .filter(location -> !location.isEmpty())
                .toArray(String[]::new);
    }
}
