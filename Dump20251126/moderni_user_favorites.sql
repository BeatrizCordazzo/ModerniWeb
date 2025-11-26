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
