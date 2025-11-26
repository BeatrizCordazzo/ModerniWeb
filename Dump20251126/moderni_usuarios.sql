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
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('cliente','admin','arquitecto') DEFAULT 'cliente',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'ana','ana@gmail.com','$2y$10$MgF8AnMOBcPVaVC7gKFUNudoYXfEDh0A8VEd/s0p7i078NcNGuvLS','123456789','cliente','2025-10-22 20:09:48'),(2,'peter','peter@gmail.com','$2y$10$2/ioSBD.4qThaUOaxnWrY.yuvOuXr753Ibvr491hx62k6GQylPxNO','455623874','cliente','2025-10-22 20:54:24'),(3,'Admin Usuario','admin@moderni.local','$2y$10$JDYw3G8OyIszk9eiMIdQxeT7H8KwI4j4dqfwT6IKOIxPi3yfJY3M2','000000000','admin','2025-10-28 14:05:16'),(4,'Arquitecto Usuario','arq@moderni.local','arqpass','111111111','arquitecto','2025-10-28 14:05:16'),(5,'Cliente Uno','cliente1@moderni.local','$2y$10$BRckdURrtgByUJh2/8EinOdpUYoa5fYqMBJKEfLCIsIGqfLHZm5GC','600111111','cliente','2025-10-28 14:22:47'),(6,'Cliente Dos','cliente2@moderni.local','cliente2pass','600222222','cliente','2025-10-28 14:22:47'),(7,'Cliente Tres','cliente3@moderni.local','cliente3pass','600333333','cliente','2025-10-28 15:26:35'),(9,'Cliente Cinco','cliente5@moderni.local','cliente5pass','600555555','cliente','2025-10-28 15:26:35'),(10,'Cliente Seis','cliente6@moderni.local','cliente6pass','600666666','cliente','2025-10-28 15:26:35'),(11,'Cliente Siete','cliente7@moderni.local','cliente7pass','600777777','cliente','2025-10-28 15:26:35'),(12,'Cliente Ocho','cliente8@moderni.local','cliente8pass','600888888','cliente','2025-10-28 15:26:35'),(13,'Cliente Nueve','cliente9@moderni.local','cliente9pass','600999999','cliente','2025-10-28 15:26:35'),(17,'Beatriz Moreira','cordazzobea@gmail.com','$2y$10$mgfUIvj6mjdVZnF7A9jjMuD0vrT.InvZmoTesAcRhg3v1pfGOgHAq',NULL,'cliente','2025-11-20 11:22:31');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:41
