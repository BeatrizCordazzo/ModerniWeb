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
