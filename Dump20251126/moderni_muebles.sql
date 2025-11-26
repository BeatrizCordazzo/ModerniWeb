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
