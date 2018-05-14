DROP TABLE IF EXISTS glpi_plugin_archimap_graphs;
ALTER TABLE glpi_plugin_archiapp_graphs RENAME TO glpi_plugin_archimap_graphs;
ALTER TABLE glpi_plugin_archimap_graphs CHANGE COLUMN plugin_archiapp_graphtypes_id plugin_archimap_graphtypes_id INT;
ALTER TABLE glpi_plugin_archimap_graphs CHANGE COLUMN plugin_archiapp_graphstates_id plugin_archimap_graphstates_id INT;
ALTER TABLE glpi_plugin_archimap_graphs RENAME KEY plugin_archiapp_graphtypes_id TO plugin_archimap_graphtypes_id;
ALTER TABLE glpi_plugin_archimap_graphs RENAME KEY plugin_archiapp_graphstates_id TO plugin_archimap_graphstates_id;

DROP TABLE IF EXISTS glpi_plugin_archimap_graphs_items;
ALTER TABLE glpi_plugin_archiapp_graphs_items RENAME TO glpi_plugin_archimap_graphs_items;
ALTER TABLE glpi_plugin_archimap_graphs_items CHANGE COLUMN plugin_archiapp_graphs_id plugin_archimap_graphs_id INT;

ALTER TABLE glpi_plugin_archiapp_profiles RENAME TO glpi_plugin_archimap_profiles;
ALTER TABLE glpi_plugin_archimap_profiles CHANGE COLUMN archiapp archimap CHAR(1);

ALTER TABLE glpi_plugin_archiapp_graphtypes RENAME TO glpi_plugin_archimap_graphtypes;
ALTER TABLE glpi_plugin_archimap_graphtypes DROP KEY glpi_plugin_archiapp_graphtype_name;
ALTER TABLE glpi_plugin_archimap_graphtypes ADD UNIQUE INDEX glpi_plugin_archimap_graphtype_name (`name` ASC);

ALTER TABLE glpi_plugin_archiapp_graphstates RENAME TO glpi_plugin_archimap_graphstates;
ALTER TABLE glpi_plugin_archimap_graphstates DROP KEY glpi_plugin_archiapp_graphstates_name;
ALTER TABLE glpi_plugin_archimap_graphstates ADD UNIQUE INDEX glpi_plugin_archimap_graphstate_name (`name` ASC);

/* Replace old path in XML description of a graph : image=../mxgraph/javascript becomes image=../javascript/mxgraph/javascript */ 
ALTER TABLE glpi_plugin_archimap_graphs
ADD COLUMN graphorig mediumtext;
UPDATE glpi_plugin_archimap_graphs SET graphorig = graph;
UPDATE glpi_plugin_archimap_graphs SET graph = REPLACE(graph, 'image%3D..%2Fmxgraph%2Fjavascript', 'image%3D..%2Fjavascript%2Fmxgraph%2Fjavascript') 
WHERE instr(graphorig,'image%3D..%2Fmxgraph%2Fjavascript') > 0