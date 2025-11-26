CREATE DATABASE IF NOT EXISTS moderni CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE moderni;

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
-- Table structure for table `architect_projects`
--

DROP TABLE IF EXISTS `architect_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `architect_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `architect_id` int NOT NULL,
  `project_title` varchar(255) DEFAULT NULL,
  `project_notes` text NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_original_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `admin_comment` text,
  `decided_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_architect_projects_architect` (`architect_id`),
  KEY `idx_architect_projects_status` (`status`),
  CONSTRAINT `fk_architect_projects_user` FOREIGN KEY (`architect_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `architect_projects`
--

LOCK TABLES `architect_projects` WRITE;
/*!40000 ALTER TABLE `architect_projects` DISABLE KEYS */;
INSERT INTO `architect_projects` VALUES (1,4,'Kitchen remodel','I’m sharing the scope of work and details for the upcoming kitchen remodel at [Client’s Name / Project Address]. Please review the following carpentry requirements and let me know if you need additional drawings or clarification before we finalize the schedule.\r\n\r\nProject Overview\r\n\r\nThe design focuses on a modern, functional kitchen with clean lines, high-quality finishes, and efficient use of space. The cabinetry will be custom-built to match the architectural plans (see drawings A-201 to A-205).\r\n\r\nScope of Work\r\n\r\nCustom Cabinetry\r\n\r\nFabricate and install full-height kitchen cabinets per dimensions in drawing A-202.\r\n\r\nMaterial: ¾” birch plywood carcass with solid maple face frames.\r\n\r\nFinish: Painted (color TBD – likely satin white).\r\n\r\nHardware: Soft-close hinges and full-extension drawer slides (Blum or equivalent).\r\n\r\nIsland Construction\r\n\r\nDimensions: 96” x 42” x 36” high.\r\n\r\nInclude provisions for electrical outlets on both sides.\r\n\r\nPaneling to match base cabinets, with solid oak end panels and decorative trim per detail D-301.\r\n\r\nTrim and Finishes\r\n\r\nInstall crown molding to match cabinet finish.\r\n\r\nBaseboards and light valance under upper cabinets.\r\n\r\nAdjustments for integrated LED lighting strip (supplied by electrician).\r\n\r\nCountertop Support\r\n\r\nProvide structural support framing for quartz countertop (2 cm thickness) as shown in section S-102.','uploads/architect_projects/architect_4_1763050924_134b8c68.docx','Resumen.docx','accepted','That\'s perfect i\'ll start on that and text you my progress.','2025-11-13 17:25:12','2025-11-13 16:22:04','2025-11-13 16:25:12');
/*!40000 ALTER TABLE `architect_projects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:40

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
-- Table structure for table `archivos_proyecto`
--

DROP TABLE IF EXISTS `archivos_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivos_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `tipo` enum('sketchup','render','plano','foto') NOT NULL,
  `url_archivo` varchar(255) NOT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `proyecto_id` (`proyecto_id`),
  CONSTRAINT `archivos_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_proyecto`
--

LOCK TABLES `archivos_proyecto` WRITE;
/*!40000 ALTER TABLE `archivos_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `archivos_proyecto` ENABLE KEYS */;
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
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('individual','set','custom') NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Chairs','individual','Dining chairs and accent chairs'),(2,'Tables','individual','Coffee tables, side tables and dining tables'),(3,'Shelves','individual','Wall shelves and storage units'),(4,'Stools','individual','Bar stools and ottoman stools'),(5,'Benches','individual','Storage benches and seating benches'),(6,'Organizers','individual','Desk organizers and storage solutions'),(7,'Mirrors','individual','Wall mirrors and decorative mirrors'),(8,'Kitchen Sets','set','Complete kitchen furniture sets'),(9,'Bathroom Sets','set','Complete bathroom furniture sets'),(10,'Bedroom Sets','set','Complete bedroom furniture sets'),(11,'Living Room Sets','set','Complete living room furniture sets');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:42

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
-- Table structure for table `colores`
--

DROP TABLE IF EXISTS `colores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `codigo_hex` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colores`
--

LOCK TABLES `colores` WRITE;
/*!40000 ALTER TABLE `colores` DISABLE KEYS */;
INSERT INTO `colores` VALUES (1,'Beige','#F5F5DC'),(2,'Gray','#808080'),(3,'Navy','#000080'),(4,'Oak','#C19A6B'),(5,'Walnut','#5C4033'),(6,'Black Metal','#1C1C1C'),(7,'White Metal','#F8F8F8'),(8,'White','#FFFFFF'),(9,'Black','#000000'),(10,'Red','#DC143C'),(11,'Emerald Green','#50C878'),(12,'Navy Blue','#000080'),(13,'Burgundy','#800020'),(14,'Gray Fabric','#A9A9A9'),(15,'Beige Fabric','#F5F5DC'),(16,'Bamboo','#D2B48C'),(17,'Brass','#B5A642'),(18,'White Oak','#F0E6D2'),(19,'Dark Oak','#6F4E37'),(20,'Natural Wood','#DEB887'),(21,'Natural Oak','#D2B48C'),(22,'Dark Walnut','#5C4033'),(23,'Light Gray','#D3D3D3'),(24,'Charcoal','#36454F'),(25,'Espresso','#3D2817'),(26,'Ivory','#FFFFF0'),(27,'Cream','#FFFDD0'),(28,'Sage Green','#9DC183'),(29,'Dusty Blue','#6B8E9F'),(30,'Taupe','#483C32');
/*!40000 ALTER TABLE `colores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','responded','closed') DEFAULT 'new',
  `admin_unread` tinyint(1) NOT NULL DEFAULT '1',
  `response` text,
  `response_user_id` int DEFAULT NULL,
  `response_created_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_messages_user` (`user_id`),
  KEY `idx_contact_messages_status` (`status`),
  KEY `fk_contact_messages_response_user` (`response_user_id`),
  CONSTRAINT `fk_contact_messages_response_user` FOREIGN KEY (`response_user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_contact_messages_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,1,'BEATRIZ MOREIRA CORDAZZO','bea@g.com','+34777777777','kitchen table','i want a big kitchen table made with classic old wood, like 2m x 1m.','responded',0,'yes sure, i\'ll send you a few of our projects.',3,'2025-11-25 15:13:29','2025-11-06 21:14:36','2025-11-25 15:13:29'),(2,2,'peter','hernandez','+34777777777','kitchen table','can you make a glass kitchen table with mosaic glass, with different colors?','new',1,NULL,NULL,NULL,'2025-11-07 09:08:59','2025-11-25 14:44:40'),(3,1,'Ana','ana@gmail.com','123456789','New project','I want to make a new project on my house, i want to make everything new, and i want to know when are you free to work on this. Thank you.','responded',0,'Yes of course, im working on 2 projects right now, but i\'ll be free in like 4 weeks, if it\'s ok for you, we\'ll talk then. Thank you.',3,'2025-11-25 14:46:21','2025-11-25 14:42:02','2025-11-25 14:46:21'),(4,3,'Ana','ana@gmail.com','123456789','Bathroom','I want to remodel my bathroom.','responded',0,'yes sure, lets do it.',3,'2025-11-25 15:15:47','2025-11-25 15:14:57','2025-11-25 15:15:47'),(5,3,'Ana','ana@gmail.com','+34611540810','Bathroom','i want to remodel it','responded',0,'yes sure.',3,'2025-11-25 15:42:08','2025-11-25 15:41:33','2025-11-25 15:42:08'),(6,1,'ana','ana@gmail.com','123456789','kitchen table','i want a round kitchen table.','responded',0,'sure.',3,'2025-11-25 15:46:10','2025-11-25 15:45:40','2025-11-25 15:46:10'),(7,1,'ana','ana@gmail.com','123456987','kitchen table','kitchen table project.','responded',0,'sure.',3,'2025-11-25 20:14:10','2025-11-25 20:12:55','2025-11-25 20:14:10'),(8,2,'peter','peter@gmail.com','321456987','bedroom closet','i want a closet for my bedroom','responded',0,'sure',3,'2025-11-25 20:17:07','2025-11-25 20:16:53','2025-11-25 20:17:07'),(9,3,'peter','peter@gmail.com','+34777777777','Question','i wanna know if you work with old, classic wood, for a table.','responded',0,'unfortunately we dont work with that kind of material.',3,'2025-11-25 20:34:23','2025-11-25 20:33:01','2025-11-25 20:34:23'),(10,3,'peter','peter@gmail.com','+34777777777','Question','a','responded',0,'n',3,'2025-11-25 20:46:51','2025-11-25 20:45:09','2025-11-25 20:46:51'),(11,3,'peter','peter@gmail.com','+34777777777','Question','bn','new',1,NULL,NULL,NULL,'2025-11-25 20:47:05',NULL),(12,3,'peter','peter@gmail.com','+34777777777','Bathroom','cbxb','responded',0,'asfedg',3,'2025-11-25 21:14:33','2025-11-25 21:13:51','2025-11-25 21:14:33');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
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
-- Table structure for table `custom_furniture_options`
--

DROP TABLE IF EXISTS `custom_furniture_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_furniture_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` varchar(100) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `min_width` int DEFAULT NULL,
  `max_width` int DEFAULT NULL,
  `min_height` int DEFAULT NULL,
  `max_height` int DEFAULT NULL,
  `depth` int DEFAULT NULL,
  `colors_json` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service` (`service`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_furniture_options`
--

LOCK TABLES `custom_furniture_options` WRITE;
/*!40000 ALTER TABLE `custom_furniture_options` DISABLE KEYS */;
INSERT INTO `custom_furniture_options` VALUES (1,'bathroom','Bathroom Vanity','storage',599.95,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',60,180,80,90,50,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Gray\",\"code\":\"#808080\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(2,'bathroom','Bathroom Mirror','accessory',199.95,'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop',50,150,60,120,5,'[{\"name\":\"Chrome Frame\",\"code\":\"#C0C0C0\"},{\"name\":\"Black Frame\",\"code\":\"#000000\"},{\"name\":\"Gold Frame\",\"code\":\"#FFD700\"},{\"name\":\"Frameless\",\"code\":\"#FFFFFF\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(3,'bathroom','Storage Cabinet','storage',399.95,'https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop',40,80,120,200,30,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Gray\",\"code\":\"#808080\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(4,'bathroom','Shower Enclosure','fixture',899.95,'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop',80,120,180,200,80,'[{\"name\":\"Clear Glass\",\"code\":\"#E8F4F8\"},{\"name\":\"Frosted Glass\",\"code\":\"#F0F0F0\"},{\"name\":\"Black Frame\",\"code\":\"#000000\"},{\"name\":\"Chrome Frame\",\"code\":\"#C0C0C0\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(5,'bathroom','Bathtub','fixture',1299.95,'https://images.unsplash.com/photo-1564540583246-934409427776?w=400&h=400&fit=crop',140,180,50,65,70,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Matte Black\",\"code\":\"#1C1C1C\"},{\"name\":\"Cream\",\"code\":\"#FFFDD0\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(6,'bathroom','Heated Towel Rack','accessory',299.95,'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',50,80,80,120,15,'[{\"name\":\"Chrome\",\"code\":\"#C0C0C0\"},{\"name\":\"Brushed Nickel\",\"code\":\"#B8B8B8\"},{\"name\":\"Matte Black\",\"code\":\"#1C1C1C\"},{\"name\":\"Brass\",\"code\":\"#B5A642\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(7,'kitchen','Base Cabinet','cabinet',299.95,'https://images.unsplash.com/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop',30,120,70,90,60,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(8,'kitchen','Upper Cabinet','cabinet',249.95,'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop',30,120,50,90,35,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(9,'kitchen','Countertop','surface',149.95,'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop',60,300,3,5,60,'[{\"name\":\"Granite Black\",\"code\":\"#1C1C1C\"},{\"name\":\"Marble White\",\"code\":\"#F5F5F5\"},{\"name\":\"Quartz Gray\",\"code\":\"#808080\"},{\"name\":\"Butcher Block\",\"code\":\"#D2691E\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(10,'kitchen','Kitchen Island','furniture',899.95,'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop',100,200,85,95,80,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Navy\",\"code\":\"#001F3F\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(11,'kitchen','Tall Pantry','storage',599.95,'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',60,100,200,240,60,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(12,'kitchen','Open Shelving Unit','storage',199.95,'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop',60,150,30,50,30,'[{\"name\":\"Natural Wood\",\"code\":\"#D2B48C\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Black Metal\",\"code\":\"#1C1C1C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(13,'livingroom','Sofa','seating',1299.95,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',180,280,80,100,90,'[{\"name\":\"Gray\",\"code\":\"#808080\"},{\"name\":\"Beige\",\"code\":\"#F5F5DC\"},{\"name\":\"Navy\",\"code\":\"#000080\"},{\"name\":\"Charcoal\",\"code\":\"#36454F\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(14,'livingroom','Coffee Table','table',399.95,'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop',100,150,40,50,60,'[{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(15,'livingroom','TV Entertainment Unit','storage',899.95,'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',150,250,50,70,45,'[{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"White Gloss\",\"code\":\"#FFFFFF\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(16,'livingroom','Bookshelf','storage',699.95,'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',80,180,180,240,35,'[{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(17,'livingroom','Side Table','table',249.95,'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',40,60,50,65,40,'[{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Marble Top\",\"code\":\"#E8F4F8\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(18,'livingroom','Accent Chair','seating',549.95,'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',60,80,80,100,70,'[{\"name\":\"Velvet Blue\",\"code\":\"#4169E1\"},{\"name\":\"Gray Fabric\",\"code\":\"#A9A9A9\"},{\"name\":\"Beige Linen\",\"code\":\"#F5F5DC\"},{\"name\":\"Emerald Green\",\"code\":\"#50C878\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(19,'bedroom','Bed Frame','furniture',900.00,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',140,200,40,150,210,'[{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-13 13:21:07'),(20,'bedroom','Nightstand','furniture',249.95,'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop',40,60,50,70,40,'[{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(21,'bedroom','Dresser','storage',699.95,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',100,180,80,120,50,'[{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(22,'bedroom','Wardrobe','storage',1299.95,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',100,250,180,240,60,'[{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Mirrored\",\"code\":\"#E8F4F8\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(23,'bedroom','Bedroom Bench','furniture',349.95,'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',100,150,40,50,40,'[{\"name\":\"Fabric Gray\",\"code\":\"#A9A9A9\"},{\"name\":\"Fabric Beige\",\"code\":\"#F5F5DC\"},{\"name\":\"Leather Brown\",\"code\":\"#654321\"},{\"name\":\"Velvet Navy\",\"code\":\"#001F3F\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(24,'bedroom','Vanity Table','furniture',499.95,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',80,120,75,80,45,'[{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Gold Accent\",\"code\":\"#FFD700\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(25,'others','Entry Console','storage',449.95,'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=400&fit=crop',90,140,75,90,35,'[{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Matte Black\",\"code\":\"#1C1C1C\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(26,'others','Accent Cabinet','storage',799.95,'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=400&fit=crop',80,140,90,120,45,'[{\"name\":\"Indigo\",\"code\":\"#264653\"},{\"name\":\"Mustard\",\"code\":\"#E9C46A\"},{\"name\":\"Forest\",\"code\":\"#2A9D8F\"},{\"name\":\"Charcoal\",\"code\":\"#333333\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(27,'others','Wall Shelf Set','storage',199.95,'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=400&fit=crop',40,120,20,40,20,'[{\"name\":\"Natural Wood\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Black\",\"code\":\"#000000\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(28,'others','Reading Chair','seating',599.95,'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop',70,90,90,110,75,'[{\"name\":\"Teal\",\"code\":\"#008080\"},{\"name\":\"Rust\",\"code\":\"#B7410E\"},{\"name\":\"Cream\",\"code\":\"#FFFDD0\"},{\"name\":\"Gray\",\"code\":\"#808080\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(29,'others','Floor Lamp','lighting',249.95,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop',30,40,150,180,30,'[{\"name\":\"Brass\",\"code\":\"#B5A642\"},{\"name\":\"Matte Black\",\"code\":\"#1C1C1C\"},{\"name\":\"White Shade\",\"code\":\"#FFFFFF\"},{\"name\":\"Bronze\",\"code\":\"#8C7853\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53'),(30,'others','Workspace Desk','furniture',549.95,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop',120,180,75,80,70,'[{\"name\":\"Oak\",\"code\":\"#D2B48C\"},{\"name\":\"Walnut\",\"code\":\"#5C4033\"},{\"name\":\"White\",\"code\":\"#FFFFFF\"},{\"name\":\"Graphite\",\"code\":\"#4B4B4B\"}]','2025-11-12 21:32:53','2025-11-12 21:32:53');
/*!40000 ALTER TABLE `custom_furniture_options` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:42

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
-- Table structure for table `detalle_presupuesto`
--

DROP TABLE IF EXISTS `detalle_presupuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_presupuesto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `presupuesto_id` int NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `presupuesto_id` (`presupuesto_id`),
  CONSTRAINT `detalle_presupuesto_ibfk_1` FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuestos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_presupuesto`
--

LOCK TABLES `detalle_presupuesto` WRITE;
/*!40000 ALTER TABLE `detalle_presupuesto` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_presupuesto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
-- Table structure for table `muebles`
--

DROP TABLE IF EXISTS `muebles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `muebles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `coleccion` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `categoria_id` int DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `tipo_producto` enum('individual','set_kitchen','set_bathroom','set_bedroom','set_livingroom') DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_anterior` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `en_stock` tinyint(1) DEFAULT '1',
  `imagen_url` varchar(255) DEFAULT NULL,
  `estilo` varchar(100) DEFAULT NULL,
  `dimensiones_ancho` varchar(50) DEFAULT NULL,
  `dimensiones_alto` varchar(50) DEFAULT NULL,
  `dimensiones_profundo` varchar(50) DEFAULT NULL,
  `incluye` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `muebles_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `muebles`
--

LOCK TABLES `muebles` WRITE;
/*!40000 ALTER TABLE `muebles` DISABLE KEYS */;
INSERT INTO `muebles` VALUES (1,'Modern Dining Chair','Nordic','Elegant dining chair with ergonomic design and premium upholstery',1,'Chairs','individual',129.95,149.95,15,1,'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(2,'Accent Chair','Luxe','Plush accent chair with velvet upholstery and gold legs',1,'Chairs','individual',300.00,NULL,8,1,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop',NULL,'','','',NULL,'2025-10-22 20:07:38'),(3,'Coffee Table','Minimalist','Sleek coffee table with wooden top and metal legs',2,'Tables','individual',189.95,NULL,12,1,'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(4,'Side Table','Scandinavian','Compact side table with drawer and shelf',2,'Tables','individual',79.95,NULL,0,0,'https://images.unsplash.com/photo-1565794529569-e6e6c4c7b77b?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(5,'Wall Shelf Unit','Industrial','Multi-level wall shelf with metal frame and wooden shelves',3,'Shelves','individual',159.95,NULL,10,1,'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(6,'Floating Shelf','Minimal','Sleek floating shelf, perfect for displays',3,'Shelves','individual',39.95,NULL,25,1,'https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(7,'Bar Stool','Modern','Adjustable bar stool with comfortable padding and chrome finish',4,'Stools','individual',89.95,109.95,20,1,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(8,'Ottoman Stool','Comfort','Soft ottoman stool with removable cover',4,'Stools','individual',69.95,NULL,15,1,'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(9,'Storage Bench','Practical','Upholstered bench with hidden storage compartment',5,'Benches','individual',149.95,NULL,7,1,'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(10,'Desk Organizer Set','Office','Complete desk organizer with multiple compartments',6,'Organizers','individual',49.95,NULL,30,1,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(11,'Round Wall Mirror','Elegance','Large round mirror with brass frame',7,'Mirrors','individual',119.95,NULL,12,1,'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop',NULL,NULL,NULL,NULL,NULL,'2025-10-22 20:07:38'),(12,'Classic Kitchen','Traditional','Complete classic kitchen set with solid wood cabinets, granite countertops, and traditional hardware',8,'Kitchen Sets','set_kitchen',5000.00,NULL,0,1,'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&h=600&fit=crop','Traditional elegance with timeless design','3.5m','2.4m','60cm','Upper cabinets (3 units)|Base cabinets with drawers (4 units)|Granite countertop|Kitchen island|Sink with faucet|Hardware and handles','2025-10-22 20:07:38'),(13,'Modern Kitchen','Contemporary','Ultra-modern kitchen with handleless cabinets, quartz countertops, and integrated appliances',8,'Kitchen Sets','set_kitchen',6499.95,NULL,0,1,'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop','Sleek contemporary design with minimalist aesthetics','4m','2.4m','60cm','Handleless upper cabinets (3 units)|Soft-close base cabinets (5 units)|Quartz countertop|Breakfast bar|Undermount sink|LED lighting strips','2025-10-22 20:07:38'),(14,'Rustic Kitchen','Farmhouse','Warm rustic kitchen with reclaimed wood elements and farmhouse sink',8,'Kitchen Sets','set_kitchen',5499.95,NULL,0,1,'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop','Cozy farmhouse charm with natural materials','3.8m','2.5m','65cm','Reclaimed wood cabinets (6 units)|Butcher block countertop|Farmhouse sink|Open shelving (2 units)|Vintage-style hardware|Wine rack','2025-10-22 20:07:38'),(15,'Classic Bathroom','Traditional','Complete classic bathroom set with porcelain fixtures, marble countertops, and elegant hardware',9,'Bathroom Sets','set_bathroom',3999.95,NULL,0,1,'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop','Timeless elegance with traditional fixtures','2.5m','2.2m','55cm','Vanity cabinet with sink|Framed mirror|Bathtub|Toilet|Marble countertop|Traditional fixtures','2025-10-22 20:07:38'),(16,'Modern Bathroom','Contemporary','Sleek modern bathroom with minimalist design and premium materials',9,'Bathroom Sets','set_bathroom',4999.95,NULL,0,1,'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop','Contemporary minimalism with clean lines','2.8m','2.4m','60cm','Floating vanity|Frameless mirror|Walk-in shower|Wall-mounted toilet|Quartz countertop|Rain shower head','2025-10-22 20:07:38'),(17,'Spa Bathroom','Luxury','Luxurious spa-inspired bathroom with premium fixtures and materials',9,'Bathroom Sets','set_bathroom',6499.95,NULL,0,1,'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop','Resort-style luxury and relaxation','3.2m','2.6m','65cm','Double vanity|Freestanding bathtub|Steam shower|Heated floors|Premium fixtures|Ambient lighting','2025-10-22 20:07:38'),(18,'Classic Bedroom','Traditional','Elegant bedroom set with solid wood furniture and traditional styling',10,'Bedroom Sets','set_bedroom',3500.00,NULL,0,1,'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop','Timeless traditional elegance','4m','2.5m','60cm','Queen bed frame|Two nightstands|Dresser with mirror|Wardrobe|Solid wood construction|Traditional hardware','2025-10-22 20:07:38'),(19,'Modern Bedroom','Contemporary','Contemporary bedroom set with clean lines and minimalist design',10,'Bedroom Sets','set_bedroom',4299.95,NULL,0,1,'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop','Sleek contemporary minimalism','4.3m','2.4m','55cm','Platform bed|Floating nightstands|Modern dresser|Walk-in closet system|Integrated lighting|Soft-close drawers','2025-10-22 20:07:38'),(20,'Scandinavian Bedroom','Nordic','Light and airy Scandinavian-inspired bedroom set',10,'Bedroom Sets','set_bedroom',3899.95,NULL,0,1,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop','Nordic simplicity meets functionality','3.8m','2.3m','58cm','Minimalist bed frame|Compact nightstands|Multi-drawer dresser|Open wardrobe|Light wood finish|Simple hardware','2025-10-22 20:07:38'),(21,'Classic Living Room','Traditional','Traditional living room set with comfortable seating and classic styling',11,'Living Room Sets','set_livingroom',3999.95,NULL,0,1,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop','Timeless comfort and elegance','5m','2.2m','90cm','Three-seater sofa|Two armchairs|Coffee table|Side tables (2)|Entertainment unit|Table lamps (2)','2025-10-22 20:07:38'),(22,'Modern Living Room','Contemporary','Contemporary living room set with modular seating and sleek design',11,'Living Room Sets','set_livingroom',5999.99,NULL,0,1,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop','Sleek modern sophistication','5.5m','2.3m','95cm','Modular sectional sofa|Chaise lounge|Glass coffee table|Media console|Floating shelves|LED accent lighting','2025-10-22 20:07:38'),(23,'Cozy Living Room','Comfort','Warm and inviting living room set perfect for family gatherings',11,'Living Room Sets','set_livingroom',4499.95,NULL,0,1,'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop','Comfortable family-friendly design','4.8m','2.1m','92cm','L-shaped sofa|Ottoman|Rustic coffee table|Bookshelf|TV stand|Cozy throw pillows','2025-10-22 20:07:38'),(32,'ngng',NULL,NULL,10,'Bedroom Sets','set_bedroom',0.02,0.01,0,1,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-12 19:48:11');
/*!40000 ALTER TABLE `muebles` ENABLE KEYS */;
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
-- Table structure for table `order_reviews`
--

DROP TABLE IF EXISTS `order_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `order_type` enum('pedido','custom') NOT NULL DEFAULT 'pedido',
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_order_review` (`order_type`,`order_id`),
  KEY `idx_order_reviews_user` (`user_id`),
  CONSTRAINT `fk_order_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_reviews`
--

LOCK TABLES `order_reviews` WRITE;
/*!40000 ALTER TABLE `order_reviews` DISABLE KEYS */;
INSERT INTO `order_reviews` VALUES (1,1,5,'pedido',5,'I’m absolutely thrilled with the classic bedroom the team created for me! The craftsmanship is outstanding — every detail, from the wardrobe to the bed frame, shows real skill and care. They perfectly captured the timeless look I wanted. Professional, reliable, and truly talented — highly recommended!','2025-11-07 12:24:05',NULL);
/*!40000 ALTER TABLE `order_reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
-- Table structure for table `pedido_items`
--

DROP TABLE IF EXISTS `pedido_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `mueble_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(12,2) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mueble_id` (`mueble_id`),
  KEY `idx_pedido_items_pedido` (`pedido_id`),
  CONSTRAINT `pedido_items_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_items_ibfk_2` FOREIGN KEY (`mueble_id`) REFERENCES `muebles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_items`
--

LOCK TABLES `pedido_items` WRITE;
/*!40000 ALTER TABLE `pedido_items` DISABLE KEYS */;
INSERT INTO `pedido_items` VALUES (1,1,NULL,'Classic Kitchen',1,4999.95,'{\"name\": \"Classic Kitchen\", \"color\": {\"code\": \"#808080\", \"name\": \"Gray\"}, \"image\": \"https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&h=600&fit=crop\", \"price\": 4999.95, \"quantity\": 1}'),(2,1,NULL,'Modern Bathroom',1,4999.95,'{\"name\": \"Modern Bathroom\", \"color\": {\"code\": \"#FFFFFF\", \"name\": \"White\"}, \"image\": \"https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop\", \"price\": 4999.95, \"quantity\": 1}'),(3,1,NULL,'Scandinavian Bedroom',1,3899.95,'{\"name\": \"Scandinavian Bedroom\", \"color\": {\"code\": \"#FFFFFF\", \"name\": \"White\"}, \"image\": \"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop\", \"price\": 3899.95, \"quantity\": 1}'),(4,2,NULL,'Scandinavian Bedroom',1,3899.95,'{\"name\": \"Scandinavian Bedroom\", \"color\": {\"code\": \"#FFFFFF\", \"name\": \"White\"}, \"image\": \"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop\", \"price\": 3899.95, \"quantity\": 1}'),(5,3,NULL,'Modern Living Room',1,5999.95,'{\"name\": \"Modern Living Room\", \"color\": {\"code\": \"#483C32\", \"name\": \"Taupe\"}, \"image\": \"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop\", \"price\": 5999.95, \"quantity\": 1}'),(6,4,NULL,'Spa Bathroom',1,6499.95,'{\"name\": \"Spa Bathroom\", \"color\": {\"code\": \"#9DC183\", \"name\": \"Sage Green\"}, \"image\": \"https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop\", \"price\": 6499.95, \"quantity\": 1}'),(7,5,NULL,'Classic Bedroom',1,3499.95,'{\"name\": \"Classic Bedroom\", \"color\": {\"code\": \"#5C4033\", \"name\": \"Dark Walnut\"}, \"image\": \"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop\", \"price\": 3499.95, \"quantity\": 1, \"dimensions\": {\"depth\": \"60cm\", \"width\": \"4m\", \"height\": \"2.5m\"}}');
/*!40000 ALTER TABLE `pedido_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:42

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
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `order_name` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `items` text,
  `total` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) DEFAULT 'pendiente',
  `payment_status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `space_width` decimal(10,2) DEFAULT NULL,
  `space_height` decimal(10,2) DEFAULT NULL,
  `space_depth` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pedidos_cliente` (`cliente_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,2,NULL,'Pedido generado desde el carrito de compras',NULL,18899.85,'pendiente','pending','2025-11-04 12:57:03','2025-11-04 20:03:37',NULL,NULL,NULL),(2,1,NULL,'Pedido generado desde el carrito de compras',NULL,8899.95,'in progress','pending','2025-11-04 19:53:48','2025-11-05 14:54:57',NULL,NULL,NULL),(3,2,NULL,'Pedido generado desde el carrito de compras',NULL,10999.95,'pendiente','pending','2025-11-04 21:15:17',NULL,NULL,NULL,NULL),(4,2,NULL,'Pedido generado desde el carrito de compras',NULL,11499.95,'in progress','pending','2025-11-05 14:35:40','2025-11-05 14:54:51',NULL,NULL,NULL),(5,1,NULL,'Pedido generado desde el carrito de compras',NULL,8499.95,'done','pending','2025-11-05 14:53:32','2025-11-05 14:54:42',4.00,2.50,60.00);
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
-- Table structure for table `presupuestos`
--

DROP TABLE IF EXISTS `presupuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estimated_total` decimal(12,2) DEFAULT NULL,
  `estado` enum('pendiente','aceptado','rechazado') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rechazo_motivo` text,
  `rechazado_por` int DEFAULT NULL,
  `fecha_rechazo` timestamp NULL DEFAULT NULL,
  `detalle` text,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `proyecto_id` (`proyecto_id`),
  CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `presupuestos_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos`
--

LOCK TABLES `presupuestos` WRITE;
/*!40000 ALTER TABLE `presupuestos` DISABLE KEYS */;
INSERT INTO `presupuestos` VALUES (1,5,1,12500.00,NULL,'aceptado','2025-10-28 14:22:47',NULL,NULL,NULL,NULL),(2,6,2,8500.00,NULL,'aceptado','2025-10-28 14:22:47',NULL,NULL,NULL,NULL),(3,7,3,7200.00,NULL,'pendiente','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(5,9,5,15000.00,NULL,'pendiente','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(6,10,6,9800.00,NULL,'aceptado','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(7,11,7,4300.00,NULL,'pendiente','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(8,12,8,6700.00,NULL,'pendiente','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(9,13,9,3800.00,NULL,'pendiente','2025-10-28 15:26:35',NULL,NULL,NULL,NULL),(13,1,13,9999.95,NULL,'aceptado','2025-10-29 15:46:38',NULL,NULL,NULL,NULL),(14,1,14,2399.70,NULL,'pendiente','2025-11-03 14:41:56',NULL,NULL,NULL,NULL),(15,1,15,2799.75,NULL,'aceptado','2025-11-03 20:58:34',NULL,NULL,NULL,NULL),(16,1,16,900.00,NULL,'aceptado','2025-11-04 08:47:35',NULL,NULL,NULL,NULL),(17,1,17,10499.95,NULL,'aceptado','2025-11-04 08:48:03',NULL,NULL,NULL,NULL),(18,1,18,3299.80,NULL,'rechazado','2025-11-04 10:25:55','sjnnaan cdxdd sfs g  gdgdgbbdf  dgd bnh sada gdfrhgdgdsg  gdh h  h452  hgrfd sfgfs  hhfhfghj h zda <',3,'2025-11-04 14:12:14',NULL),(19,1,19,3149.80,NULL,'aceptado','2025-11-04 10:55:14',NULL,NULL,NULL,'{\n  \"furniture\": [\n    {\"name\":\"Bed Frame\",\"quantity\":1,\"dimensions\":{\"width\":200,\"height\":120,\"depth\":180},\"price\":1499.90,\"image\":\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop\"},\n    {\"name\":\"Nightstand\",\"quantity\":2,\"dimensions\":{\"width\":45,\"height\":55,\"depth\":40},\"price\":399.95,\"image\":\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop\"},\n    {\"name\":\"Dresser\",\"quantity\":1,\"dimensions\":{\"width\":120,\"height\":90,\"depth\":45},\"price\":1249.95,\"image\":\"https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop\"}\n  ],\n  \"images\": [\n    \"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop\",\n    \"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop\",\n    \"https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop\"\n  ],\n  \"spaceDimensions\":{\"width\":350,\"height\":260,\"depth\":220},\n  \"meta\":{\"added_by\":\"script\",\"added_at\":\"2025-11-04T00:00:00Z\"}\n}'),(20,1,20,1699.85,NULL,'aceptado','2025-11-04 12:12:52',NULL,NULL,NULL,'{\"furniture\":[{\"name\":\"Bathroom Vanity\",\"quantity\":1,\"dimensions\":{\"width\":60,\"height\":80,\"depth\":50},\"price\":599.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Bathroom Mirror\",\"quantity\":1,\"dimensions\":{\"width\":50,\"height\":60,\"depth\":5},\"price\":199.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1618220179428-22790b461013?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Shower Enclosure\",\"quantity\":1,\"dimensions\":{\"width\":80,\"height\":180,\"depth\":80},\"price\":899.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop\",\"meta\":null}],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1618220179428-22790b461013?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop\"],\"spaceDimensions\":{\"width\":100,\"height\":200,\"depth\":150},\"meta\":{\"sent_at\":\"2025-11-04T13:12:52+01:00\",\"client_email\":null,\"saved_by\":\"create_custom_order.php\"}}'),(21,2,21,2799.99,NULL,'aceptado','2025-11-04 12:18:32',NULL,NULL,NULL,'{\"furniture\":[{\"name\":\"Base Cabinet\",\"quantity\":1,\"dimensions\":{\"width\":30,\"height\":70,\"depth\":60},\"price\":299.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Upper Cabinet\",\"quantity\":1,\"dimensions\":{\"width\":30,\"height\":50,\"depth\":35},\"price\":249.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Countertop\",\"quantity\":1,\"dimensions\":{\"width\":60,\"height\":3,\"depth\":60},\"price\":149.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Kitchen Island\",\"quantity\":1,\"dimensions\":{\"width\":100,\"height\":85,\"depth\":80},\"price\":899.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Open Shelving Unit\",\"quantity\":1,\"dimensions\":{\"width\":60,\"height\":30,\"depth\":30},\"price\":199.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Tall Pantry\",\"quantity\":1,\"dimensions\":{\"width\":60,\"height\":200,\"depth\":60},\"price\":599.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop\",\"meta\":null}],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop\"],\"spaceDimensions\":{\"width\":100,\"height\":203,\"depth\":42},\"meta\":{\"sent_at\":\"2025-11-04T13:18:32+01:00\",\"client_email\":null,\"saved_by\":\"create_custom_order.php\"}}'),(22,2,22,4100.00,NULL,'aceptado','2025-11-04 12:22:06',NULL,NULL,NULL,'{\"furniture\":[{\"name\":\"Coffee Table\",\"quantity\":1,\"dimensions\":{\"width\":100,\"height\":40,\"depth\":60},\"price\":399.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Sofa\",\"quantity\":1,\"dimensions\":{\"width\":180,\"height\":80,\"depth\":90},\"price\":1299.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"TV Entertainment Unit\",\"quantity\":1,\"dimensions\":{\"width\":150,\"height\":50,\"depth\":45},\"price\":899.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Bookshelf\",\"quantity\":1,\"dimensions\":{\"width\":80,\"height\":180,\"depth\":35},\"price\":699.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Side Table\",\"quantity\":1,\"dimensions\":{\"width\":40,\"height\":50,\"depth\":40},\"price\":249.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Accent Chair\",\"quantity\":1,\"dimensions\":{\"width\":60,\"height\":80,\"depth\":70},\"price\":549.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop\",\"meta\":null}],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop\"],\"spaceDimensions\":{\"width\":303,\"height\":202,\"depth\":304},\"meta\":{\"sent_at\":\"2025-11-04T13:22:06+01:00\",\"client_email\":null,\"saved_by\":\"create_custom_order.php\"}}'),(23,1,23,3500.00,3299.80,'aceptado','2025-11-06 10:00:37',NULL,NULL,NULL,'{\"furniture\":[{\"name\":\"Sofa\",\"quantity\":1,\"dimensions\":{\"width\":180,\"height\":80,\"depth\":90},\"price\":1299.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Coffee Table\",\"quantity\":1,\"dimensions\":{\"width\":100,\"height\":40,\"depth\":60},\"price\":399.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"TV Entertainment Unit\",\"quantity\":1,\"dimensions\":{\"width\":150,\"height\":50,\"depth\":45},\"price\":899.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\",\"meta\":null},{\"name\":\"Bookshelf\",\"quantity\":1,\"dimensions\":{\"width\":80,\"height\":180,\"depth\":35},\"price\":699.95,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\",\"meta\":null}],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop\",\"https:\\/\\/images.unsplash.com\\/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop\"],\"spaceDimensions\":{\"width\":302,\"height\":205,\"depth\":303},\"meta\":{\"sent_at\":\"2025-11-06T11:00:37+01:00\",\"client_email\":null,\"saved_by\":\"create_custom_order.php\"}}');
/*!40000 ALTER TABLE `presupuestos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:42

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
-- Table structure for table `proyectos_showcase`
--

DROP TABLE IF EXISTS `proyectos_showcase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos_showcase` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text,
  `categoria` enum('kitchen','bathroom','bedroom','livingroom','others') NOT NULL,
  `cliente` varchar(150) DEFAULT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `fecha_completado` date DEFAULT NULL,
  `duracion_dias` int DEFAULT NULL,
  `presupuesto` decimal(10,2) DEFAULT NULL,
  `imagen_principal` varchar(500) DEFAULT NULL,
  `imagen_2` varchar(500) DEFAULT NULL,
  `imagen_3` varchar(500) DEFAULT NULL,
  `imagen_4` varchar(500) DEFAULT NULL,
  `estilo` varchar(100) DEFAULT NULL,
  `area_m2` decimal(10,2) DEFAULT NULL,
  `materiales` text,
  `destacado` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos_showcase`
--

LOCK TABLES `proyectos_showcase` WRITE;
/*!40000 ALTER TABLE `proyectos_showcase` DISABLE KEYS */;
INSERT INTO `proyectos_showcase` VALUES (1,'Modern Kitchen Renovation','Complete kitchen transformation with custom cabinets, quartz countertops, and integrated appliances. The design emphasizes clean lines and functionality while maximizing storage space.','kitchen','Rodríguez Family','Madrid','2024-09-15',45,18500.00,'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop','Contemporary',25.50,'High-gloss white lacquer cabinets|Quartz countertops|Stainless steel appliances|LED under-cabinet lighting|Soft-close hardware',1,'2025-10-22 20:07:38'),(2,'Rustic Farmhouse Kitchen','Charming rustic kitchen featuring reclaimed wood elements, open shelving, and a farmhouse sink. Traditional design meets modern functionality.','kitchen','García Residence','Barcelona','2024-08-22',38,15200.00,'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop','Rustic Farmhouse',22.00,'Reclaimed oak cabinets|Butcher block countertops|Ceramic farmhouse sink|Open wood shelving|Vintage brass fixtures',0,'2025-10-22 20:07:38'),(3,'Industrial Loft Kitchen','Bold industrial design with exposed brick, metal accents, and concrete countertops. Perfect for modern urban living.','kitchen','López Studio','Valencia','2024-07-10',42,16800.00,'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&h=600&fit=crop','Industrial',28.00,'Metal-framed cabinets|Polished concrete countertops|Exposed brick backsplash|Industrial pendant lights|Black steel fixtures',1,'2025-10-22 20:07:38'),(4,'Luxury Spa Bathroom','Resort-style spa bathroom with freestanding soaking tub, walk-in rain shower, and premium natural stone finishes. A personal sanctuary for relaxation.','bathroom','Martínez Estate','Marbella','2024-09-01',30,22000.00,'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1564540583246-934409427776?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop','Luxury Spa',18.50,'Travertine stone tiles|Freestanding bathtub|Frameless glass shower|Double vanity|Heated floors|Ambient LED lighting',1,'2025-10-22 20:07:38'),(5,'Modern Minimalist Bathroom','Sleek contemporary bathroom with floating vanity, frameless fixtures, and monochromatic color scheme. Clean lines and sophisticated simplicity.','bathroom','Fernández Apartment','Madrid','2024-08-15',25,12500.00,'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1564540583246-934409427776?w=800&h=600&fit=crop','Contemporary',12.00,'White porcelain tiles|Floating vanity|Wall-mounted toilet|Frameless mirror|Matte black fixtures|LED backlit mirror',0,'2025-10-22 20:07:38'),(6,'Classic Traditional Bathroom','Elegant traditional bathroom with marble countertops, ornate fixtures, and timeless design elements. Sophisticated and functional.','bathroom','Sánchez Villa','Sevilla','2024-07-20',28,14800.00,'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1564540583246-934409427776?w=800&h=600&fit=crop','Traditional',15.00,'Carrara marble countertop|Classic wood vanity|Chrome fixtures|Framed mirror|Subway tile|Elegant hardware',0,'2025-10-22 20:07:38'),(7,'Master Bedroom Suite','Luxurious master bedroom with custom built-in wardrobes, upholstered headboard, and integrated lighting. Creating the perfect retreat.','bedroom','Torres Penthouse','Barcelona','2024-09-10',35,16500.00,'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=600&fit=crop','Contemporary Luxury',30.00,'Built-in wardrobes|Upholstered bed frame|Premium wood flooring|Integrated LED lighting|Custom nightstands|Soft-close drawers',1,'2025-10-22 20:07:38'),(8,'Scandinavian Bedroom','Light and airy Nordic-inspired bedroom with light wood furniture, minimalist design, and functional storage solutions.','bedroom','Andersen Home','Madrid','2024-08-05',28,11200.00,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop','Scandinavian',22.00,'Light oak furniture|Minimalist bed frame|Open wardrobe system|Natural fiber textiles|Simple hardware|White wall finishes',0,'2025-10-22 20:07:38'),(9,'Modern Platform Bedroom','Contemporary bedroom with platform bed, floating nightstands, and sleek storage solutions. Sophisticated minimalism.','bedroom','Silva Residence','Valencia','2024-07-28',32,13800.00,'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop','Modern',25.00,'Platform bed with storage|Floating nightstands|Built-in closet system|LED accent lighting|High-gloss finishes|Modern hardware',0,'2025-10-22 20:07:38'),(10,'Contemporary Living Space','Open-concept living room with custom entertainment unit, built-in shelving, and modern furniture. Perfect for entertaining.','livingroom','Morales Family','Madrid','2024-09-18',40,19500.00,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=600&fit=crop','Contemporary',35.00,'Custom entertainment unit|Built-in shelving|Premium upholstery|Wood flooring|Recessed lighting|Modern coffee table',1,'2025-10-22 20:07:38'),(11,'Cozy Traditional Living Room','Warm and inviting traditional living room with custom built-ins, classic furniture, and rich wood finishes.','livingroom','Delgado Home','Barcelona','2024-08-12',36,17200.00,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=600&fit=crop','Traditional',32.00,'Built-in bookshelves|Classic wood furniture|Area rug|Traditional hardware|Crown molding|Table lamps',0,'2025-10-22 20:07:38'),(12,'Industrial Living Loft','Urban industrial living space with exposed elements, metal accents, and custom furniture pieces. Modern city living.','livingroom','Costa Loft','Valencia','2024-07-15',38,18600.00,'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&h=600&fit=crop','Industrial',40.00,'Metal shelving units|Exposed brick|Leather furniture|Concrete accents|Industrial lighting|Reclaimed wood',1,'2025-10-22 20:07:38'),(13,'Custom Home Office','Bespoke home office with built-in desk, custom shelving, and ergonomic storage solutions. Productivity meets style.','others','Ramírez Studio','Madrid','2024-09-05',25,8500.00,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop','Modern',15.00,'Built-in desk system|Custom shelving|Cable management|Ergonomic storage|LED task lighting|Premium wood finish',0,'2025-10-22 20:07:38'),(14,'Dining Room Furniture Set','Complete custom dining room set with extendable table, matching chairs, and sideboard. Perfect for family gatherings.','others','Navarro Family','Barcelona','2024-08-20',30,12000.00,'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1565794529569-e6e6c4c7b77b?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop','Contemporary',20.00,'Extendable dining table|Upholstered dining chairs|Matching sideboard|Premium wood|Custom finish|Soft-close drawers',0,'2025-10-22 20:07:38'),(15,'Entry Hall Solution','Custom entryway furniture including coat storage, shoe cabinet, and decorative mirror. First impressions matter.','others','Jiménez Home','Sevilla','2024-07-25',20,5800.00,'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop','Modern',8.00,'Built-in coat storage|Shoe cabinet|Wall mirror|Bench seating|Hooks and organizers|Durable finishes',0,'2025-10-22 20:07:38');
/*!40000 ALTER TABLE `proyectos_showcase` ENABLE KEYS */;
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
-- Table structure for table `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `arquitecto_id` int DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `estado` enum('pendiente','en_diseño','en_fabricacion','entregado') DEFAULT 'pendiente',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `carpintero_estado` enum('to-do','in progress','done') DEFAULT 'to-do',
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `arquitecto_id` (`arquitecto_id`),
  CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`arquitecto_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,5,4,'Proyecto Cocina Cliente1','Renovación completa de cocina.','pendiente','2025-10-01','2025-11-15','done'),(2,6,4,'Proyecto Baño Cliente2','Rediseño del baño principal.','pendiente','2025-10-10','2025-11-05','in progress'),(3,7,4,'Proyecto Living Cliente3','Reforma del living con nueva carpintería.','pendiente','2025-10-05','2025-11-20','to-do'),(5,9,4,'Proyecto Cocina Cliente5','Actualización de mobiliario y encimera.','pendiente','2025-10-08','2025-12-01','done'),(6,10,4,'Proyecto Baño Cliente6','Nueva distribución y carpintería a medida.','pendiente','2025-10-09','2025-11-18','to-do'),(7,11,4,'Proyecto Oficina Cliente7','Mobiliario a medida para oficina en casa.','pendiente','2025-10-11','2025-11-30','to-do'),(8,12,4,'Proyecto Terraza Cliente8','Deck y cerramiento de carpintería.','pendiente','2025-10-12','2025-11-25','to-do'),(9,13,4,'Proyecto Hall Cliente9','Mobiliario y revestimientos de madera.','pendiente','2025-10-13','2025-11-10','in progress'),(13,1,4,'Pedido desde carrito - 2025-10-29T15:46:38.471Z','Pedido generado desde el carrito de compras','pendiente','2025-10-29',NULL,'to-do'),(14,1,4,'Pedido personalizado 2025-11-03 15:41:56','{\"width\":100,\"height\":200,\"depth\":40}','pendiente','2025-11-03',NULL,'in progress'),(15,1,4,'Pedido personalizado 2025-11-03 21:58:34','{\"width\":100,\"height\":200,\"depth\":150}','pendiente','2025-11-03',NULL,'to-do'),(16,1,4,'Pedido personalizado 2025-11-04 09:47:35','{\"width\":100,\"height\":200,\"depth\":150}','pendiente','2025-11-04',NULL,'to-do'),(17,1,4,'Pedido desde carrito - 2025-11-04T08:48:03.919Z','Pedido generado desde el carrito de compras','pendiente','2025-11-04',NULL,'to-do'),(18,1,4,'Pedido personalizado 2025-11-04 11:25:55','{\"width\":300,\"height\":200,\"depth\":300}','pendiente','2025-11-04',NULL,'to-do'),(19,1,4,'Pedido personalizado - Bed Frame, Nightstand, Dresser','{\"width\":200,\"height\":200,\"depth\":200}','pendiente','2025-11-04',NULL,'to-do'),(20,1,4,'Pedido personalizado - Bathroom Vanity, Bathroom Mirror, Shower Enclosure','{\"width\":100,\"height\":200,\"depth\":150}','pendiente','2025-11-04',NULL,'to-do'),(21,2,4,'Pedido personalizado - Base Cabinet, Upper Cabinet, Countertop','{\"width\":100,\"height\":203,\"depth\":42}','pendiente','2025-11-04',NULL,'to-do'),(22,2,4,'Pedido personalizado - Coffee Table, Sofa, TV Entertainment Unit','{\"width\":303,\"height\":202,\"depth\":304}','pendiente','2025-11-04',NULL,'to-do'),(23,1,4,'Pedido personalizado - Sofa, Coffee Table, TV Entertainment Unit','{\"width\":302,\"height\":205,\"depth\":303}','pendiente','2025-11-06',NULL,'in progress');
/*!40000 ALTER TABLE `proyectos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:42

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
-- Table structure for table `reseñas`
--

DROP TABLE IF EXISTS `reseñas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reseñas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comentario` text,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `proyecto_id` (`proyecto_id`),
  CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  CONSTRAINT `reseñas_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reseñas`
--

LOCK TABLES `reseñas` WRITE;
/*!40000 ALTER TABLE `reseñas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reseñas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
-- Table structure for table `sketchup_projects`
--

DROP TABLE IF EXISTS `sketchup_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sketchup_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `embed_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sketchup_admin` (`admin_id`),
  CONSTRAINT `fk_sketchup_admin` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sketchup_projects`
--

LOCK TABLES `sketchup_projects` WRITE;
/*!40000 ALTER TABLE `sketchup_projects` DISABLE KEYS */;
INSERT INTO `sketchup_projects` VALUES (7,3,'Home',NULL,'uploads/sketchup/skp_3_1763632113_ab9ccae3.skp','skp_3_1763413609_da33abad.skp','https://3dwarehouse.sketchup.com/embed/08287286-1b45-463b-a83d-0365ceca329f?token=HOnLCVuzOzA=&binaryName=s21','2025-11-20 09:48:33'),(8,3,'Kitchen',NULL,'uploads/sketchup/skp_3_1763635323_1ab6d9bf.skp','230224=cozinha.skp','https://3dwarehouse.sketchup.com/embed/5cb9608b-58ec-41f2-a2ed-8195bd8e97b9?token=gNPq_91liL4=&binaryName=s21','2025-11-20 10:42:03');
/*!40000 ALTER TABLE `sketchup_projects` ENABLE KEYS */;
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
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_type` enum('product','service','custom') DEFAULT 'product',
  `item_id` int DEFAULT NULL,
  `item_slug` varchar(120) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_image` varchar(255) DEFAULT NULL,
  `item_price` decimal(12,2) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_favorite` (`user_id`,`item_type`,`item_id`,`item_slug`),
  KEY `idx_user_favorites_user` (`user_id`),
  CONSTRAINT `fk_user_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,1,'service',22,'livingroom-set-22','Modern Living Room','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',5999.99,'{\"style\": \"Sleek modern sophistication\", \"category\": \"livingroom\"}','2025-11-06 11:25:46'),(3,1,'product',3,'product-3','Coffee Table','https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop',189.95,'{\"category\": \"Tables\"}','2025-11-06 11:26:06'),(4,1,'service',14,'kitchen-set-14','Rustic Kitchen','https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop',5499.95,'{\"style\": \"Cozy farmhouse charm with natural materials\", \"category\": \"kitchen\"}','2025-11-13 11:24:52'),(5,17,'service',13,'kitchen-set-13','Modern Kitchen','https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',6499.95,'{\"style\": \"Sleek contemporary design with minimalist aesthetics\", \"category\": \"kitchen\"}','2025-11-24 14:27:31');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:40

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
-- Table structure for table `user_fcm_tokens`
--

DROP TABLE IF EXISTS `user_fcm_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_fcm_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(512) NOT NULL,
  `platform` enum('web','android','ios') DEFAULT 'web',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_token` (`user_id`,`token`),
  KEY `idx_token_user` (`user_id`),
  CONSTRAINT `fk_fcm_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_fcm_tokens`
--

LOCK TABLES `user_fcm_tokens` WRITE;
/*!40000 ALTER TABLE `user_fcm_tokens` DISABLE KEYS */;
INSERT INTO `user_fcm_tokens` VALUES (1,1,'dZcjxRyx6lZYJG1ho6S2A9:APA91bHTGs0pzt3rGnibGh_tesoL3wgTt96HtTrj13A_t-xLz_NPH0eKWSi5CHr2A7xRjXZRuNwNPppw3WaSH6XqeUhCf1UpDYAGv94DwctRKqpvr7W7HmM','web','2025-11-25 14:24:15','2025-11-25 14:44:48'),(2,3,'dZcjxRyx6lZYJG1ho6S2A9:APA91bHTGs0pzt3rGnibGh_tesoL3wgTt96HtTrj13A_t-xLz_NPH0eKWSi5CHr2A7xRjXZRuNwNPppw3WaSH6XqeUhCf1UpDYAGv94DwctRKqpvr7W7HmM','web','2025-11-25 14:42:16','2025-11-25 15:03:59'),(9,3,'f6TrdYLtT9Q9YvyTTvCzZ3:APA91bFsWhZ2X0PQTOGNC3x_PlENTynDP9NckVJ0pqVjzaizPRql9ZLmZ3ksLFBwm8LWfccG518nQoLOZO-GM6LhiGscutuHW4H-TSmNg9ahU1RbxDseBnQ','web','2025-11-25 15:12:34','2025-11-25 15:45:07'),(17,2,'fp8TXUYa6uPVLn5RMfCgZt:APA91bGnKrUEoL2PX5-Y0CkjSvjkhDPOgtfLMvN4ERPG_MX9fbw5yEuZW9zreuihFAMxz7A77HsypTS7RbKIBxw0O8ory8DvronEzSAEHTP4GlsHzB7vq_A','web','2025-11-25 20:15:47',NULL),(18,3,'emXf8NS2Eqlb9r29pr1Zsr:APA91bEH-k4_Vpi6NNfW3z1xSaBeLKQcx1fgg0gk7z71Acl1a7kzkXfiRL0i-Vgpu1l4zUYTSaG0Pg9k8GSAWpal9LOEBBn4cyxMdRnEZqkBOsDZLmmampA','web','2025-11-25 20:20:24','2025-11-25 20:20:56'),(20,5,'fp8TXUYa6uPVLn5RMfCgZt:APA91bGnKrUEoL2PX5-Y0CkjSvjkhDPOgtfLMvN4ERPG_MX9fbw5yEuZW9zreuihFAMxz7A77HsypTS7RbKIBxw0O8ory8DvronEzSAEHTP4GlsHzB7vq_A','web','2025-11-25 20:21:21',NULL),(21,3,'fp8TXUYa6uPVLn5RMfCgZt:APA91bFjd-O8D6ogTH54rXZB6UdKC5HFqOXNUdsMmqSDgOUsrA0IyOek-svlR_Z4VD5qMpCJ0Ym17kbyP2fph5HIIoJ8u1E-xVqSrqh6WNu_Me4wJO1P8AE','web','2025-11-25 20:25:10',NULL),(22,3,'fp8TXUYa6uPVLn5RMfCgZt:APA91bGQc_ASboHT53cwHh_63tzaCk21we4Ee2mrn_u_HqrVhwmLtNaJTL32rD49Y14kkjeO3OHVn8ps6ci6Kp0a_hXlx37sYYeJxl-X-bOSYAdsaT4tVl0','web','2025-11-25 20:28:01','2025-11-25 20:39:36'),(24,3,'c67bJR13STs8xi_j9ye-tj:APA91bF9DSgF-4fTVQsV89tsIXge5ZGrxWyOdCDBlKok-G4fpi17dsWFRMsek_l6NZvEij7FZFje8GQr2HKC9fY_LwyPTWYgM9JpMN6XvpAmR8IsrLz1efk','web','2025-11-25 21:13:28',NULL);
/*!40000 ALTER TABLE `user_fcm_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 11:49:43

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
