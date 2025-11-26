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
