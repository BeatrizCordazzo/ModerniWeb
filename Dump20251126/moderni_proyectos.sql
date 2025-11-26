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
