UPDATE glpi_plugin_archimap_configs 
SET value = REPLACE(value,'/archimap/drawio-integration/','/archimap/public/drawio-integration/')
WHERE type = 'STYLE' AND value like '%/archimap/drawio-integration/%';

