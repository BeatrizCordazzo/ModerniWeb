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
