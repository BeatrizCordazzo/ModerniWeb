-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: moderni
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `colores_mueble`
--

DROP TABLE IF EXISTS `colores_mueble`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colores_mueble` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mueble_id` int NOT NULL,
  `color_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mueble_color` (`mueble_id`,`color_id`),
  KEY `color_id` (`color_id`),
  CONSTRAINT `colores_mueble_ibfk_1` FOREIGN KEY (`mueble_id`) REFERENCES `muebles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `colores_mueble_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colores_mueble`
--

LOCK TABLES `colores_mueble` WRITE;
/*!40000 ALTER TABLE `colores_mueble` DISABLE KEYS */;
INSERT INTO `colores_mueble` VALUES (1,1,1),(2,1,2),(3,1,3),(4,2,11),(5,2,12),(6,2,13),(7,3,4),(8,3,5),(9,4,18),(10,4,19),(11,5,6),(12,5,7),(14,6,8),(15,6,9),(13,6,20),(16,7,8),(17,7,9),(18,7,10),(19,8,14),(20,8,15),(21,9,14),(22,9,15),(24,10,8),(23,10,16),(26,11,9),(25,11,17),(30,12,2),(29,12,8),(27,12,21),(28,12,22),(31,13,8),(32,13,23),(33,13,24),(34,13,25),(36,14,5),(35,14,21),(37,14,26),(40,15,2),(38,15,8),(39,15,26),(41,16,8),(42,16,9),(43,16,24),(44,17,27),(45,17,28),(46,17,29),(49,18,8),(47,18,22),(48,18,25),(52,19,5),(50,19,8),(51,19,23),(55,20,8),(53,20,18),(54,20,21),(58,21,3),(56,21,14),(57,21,15),(60,22,8),(59,22,23),(61,22,30),(63,23,5),(62,23,14),(64,23,27);
/*!40000 ALTER TABLE `colores_mueble` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:44
