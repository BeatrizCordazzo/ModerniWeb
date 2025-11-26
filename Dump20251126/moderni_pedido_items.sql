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
