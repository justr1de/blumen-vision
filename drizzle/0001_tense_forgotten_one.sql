CREATE TABLE `bi_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(500) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`filtros` json,
	`dados` json,
	`clienteId` int NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bi_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`tipo` varchar(100) NOT NULL,
	`periodo` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`tenantId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `concentracao_bancos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`banco` varchar(200) NOT NULL,
	`receitas` double DEFAULT 0,
	`despesas` double DEFAULT 0,
	`lancamentos` int DEFAULT 0,
	CONSTRAINT `concentracao_bancos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concentracao_categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`categoria` varchar(200) NOT NULL,
	`valorTotal` double DEFAULT 0,
	`lancamentos_count` int DEFAULT 0,
	CONSTRAINT `concentracao_categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concentracao_lojas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`loja` varchar(200) NOT NULL,
	`receitas` double DEFAULT 0,
	`despesas` double DEFAULT 0,
	`lancamentos_count` int DEFAULT 0,
	CONSTRAINT `concentracao_lojas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crediarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteNome` varchar(200) NOT NULL,
	`valorOriginal` double NOT NULL,
	`valorPago` double NOT NULL DEFAULT 0,
	`saldo` double NOT NULL DEFAULT 0,
	`status` varchar(50) NOT NULL,
	`dataVenda` timestamp NOT NULL,
	`clienteId` int NOT NULL,
	CONSTRAINT `crediarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`nome` varchar(500) NOT NULL,
	`nivel` int NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`codigoPai` varchar(50),
	`valores` json,
	`total` double NOT NULL DEFAULT 0,
	`clienteId` int NOT NULL,
	CONSTRAINT `dre_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `dre_items_unique` UNIQUE(`clienteId`,`codigo`)
);
--> statement-breakpoint
CREATE TABLE `evolucao_mensal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`mes` varchar(20) NOT NULL,
	`mesLabel` varchar(20) NOT NULL,
	`receitas` double NOT NULL DEFAULT 0,
	`despesas` double NOT NULL DEFAULT 0,
	`deducoes` double DEFAULT 0,
	`financeiro` double DEFAULT 0,
	`resultado` double DEFAULT 0,
	CONSTRAINT `evolucao_mensal_id` PRIMARY KEY(`id`),
	CONSTRAINT `evolucao_mensal_unique` UNIQUE(`clienteId`,`mes`)
);
--> statement-breakpoint
CREATE TABLE `kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`dados` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lancamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` timestamp NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`descricao` text NOT NULL,
	`valor` double NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`banco` varchar(200),
	`loja` varchar(200),
	`categoria` varchar(200),
	`clienteId` int NOT NULL,
	`contaId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lancamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patrimoniais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`socio` varchar(200) NOT NULL,
	`valor` double NOT NULL,
	`data` timestamp NOT NULL,
	`descricao` text,
	`clienteId` int NOT NULL,
	CONSTRAINT `patrimoniais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plano_contas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`nome` varchar(500) NOT NULL,
	`nivel` int NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`codigoPai` varchar(50),
	`categoriaGerencial` varchar(200),
	`clienteId` int NOT NULL,
	CONSTRAINT `plano_contas_id` PRIMARY KEY(`id`),
	CONSTRAINT `plano_contas_unique` UNIQUE(`clienteId`,`codigo`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`tipo` varchar(50) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `top_clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`clienteNome` varchar(200) NOT NULL,
	`faturamento` double NOT NULL DEFAULT 0,
	`quantidade` double DEFAULT 0,
	CONSTRAINT `top_clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`resultado` json,
	`userId` int,
	`clienteId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','auditor') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `crediarios_cliente_status_idx` ON `crediarios` (`clienteId`,`status`);--> statement-breakpoint
CREATE INDEX `dre_items_cliente_idx` ON `dre_items` (`clienteId`);--> statement-breakpoint
CREATE INDEX `lancamentos_cliente_data_idx` ON `lancamentos` (`clienteId`,`data`);--> statement-breakpoint
CREATE INDEX `lancamentos_cliente_banco_idx` ON `lancamentos` (`clienteId`,`banco`);--> statement-breakpoint
CREATE INDEX `lancamentos_cliente_tipo_idx` ON `lancamentos` (`clienteId`,`tipo`);--> statement-breakpoint
CREATE INDEX `patrimoniais_cliente_tipo_idx` ON `patrimoniais` (`clienteId`,`tipo`);--> statement-breakpoint
CREATE INDEX `plano_contas_cliente_idx` ON `plano_contas` (`clienteId`);