<template>
  <div class="map">
    <h3>Карта офиса</h3>

    <div v-if="!loader.isLoadingOrErrorState" class="map-root">
      <MapSvg ref="svg" />
      <TableSvg v-show="false" ref="table" />
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import * as d3 from "d3";

import LoaderService from "@/services/loader";

import MapSvg from "@/assets/images/map.svg";
import TableSvg from "@/assets/images/workPlace.svg";

import tables from "@/assets/data/tables.json";
import legend from "@/assets/data/legend.json";
import people from "@/assets/data/people.json";

export default {
  name: "Map",

  components: {
    MapSvg,
    TableSvg,
  },

  data() {
    return {
      isLoading: false,
      svg: null,
      g: null,
      tableSvg: null,
      tables: [],
      legend: [],
      people: [],
      loader: new LoaderService(),
    };
  },

  created() {
    this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const data = await this.loader.handleLoading(
          new Promise((res) => {
            setTimeout(() => res({ tables, legend, people }), 1000);
          })
        );

        this.tables = data.tables;
        this.legend = data.legend;
        this.people = data.people;

        this.$nextTick(() => this.init());
      } catch (e) {
        console.warn(e);
      }
    },

    init() {
      this.svg = d3.select(this.$refs.svg);
      this.g = this.svg.select("g");
      this.tableSvg = d3.select(this.$refs.table);

      if (this.g) {
        this.drawTables();
      } else {
        console.error("ERROR");
      }
    },

    drawTables() {
      const svgTablesGroup = this.svg.append("g");

      this.tables.forEach((table) => {
        const isTableOccupied = this.people.find(
          (item) => item.tableId === table._id
        );
        const legendItem = this.legend.find(
          (item) => item.group_id === table.group_id
        );
        const tableColor =
          isTableOccupied && legendItem?.color
            ? legendItem?.color
            : "transparent";

        const svgTable = svgTablesGroup
          .append("g")
          .attr("transform", `translate(${table.x}, ${table.y}) scale (0.5)`)
          .attr("id", table._id)
          .attr("fill", tableColor)
          .classed("employee-place", true);

        svgTable
          .append("g")
          .attr("transform", `rotate(${table.rotate || 0})`)
          .html(this.tableSvg.html());

        this.addTableEventListeners(svgTable, table);
      });
    },

    addTableEventListeners(tableElement, tableData) {
      const person =
        this.people.find((item) => item.tableId === tableData._id) || {};

      tableElement.on("click", (event) => {
        event.stopPropagation();
        this.$emit("update:person", person);
      });
    },
  },
};
</script>

<style scoped>
.map {
  height: 100%;
  width: 100%;
  padding: 24px;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.map-root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

h3 {
  margin-top: 0px;
}

::v-deep svg {
  height: 100%;
  width: 100%;
}

::v-deep .table {
  cursor: pointer;
}
</style>
