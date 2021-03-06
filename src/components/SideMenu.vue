<template>
  <div class="menu" v-on-click-outside="closeProfile">
    <div class="toolbar">
      <div class="toolbar__header">
        <template v-if="!isUserOpened">
          <h3>Информация</h3>
        </template>
        <template v-else>
          <div class="action" @click.stop="closeProfile">
            <div class="arrow"></div>
          </div>
          <h3>Профиль</h3>
        </template>
      </div>
      <div class="toolbar__actions"></div>
    </div>
    <div v-if="!loader.isLoadingOrErrorState" class="content">
      <div v-if="!isUserOpened" class="legend">
        <div class="legend__data">
          <div v-if="legend.length > 0" class="legend__items">
            <Draggable v-model="legend">
              <transition-group>
                <LegendItem
                  v-for="item in legend"
                  :key="item.group_id"
                  :color="item.color"
                  :text="item.text"
                  :counter="item.counter"
                  class="legend__item"
                />
              </transition-group>
            </Draggable>
          </div>
          <span v-else class="legend--empty"> Список пуст </span>
        </div>
        <div class="legend__chart">
          <Doughnut v-if="legend.length > 0" :legend="legend" />
        </div>
      </div>
      <div v-else class="profile">
        <div v-if="!isUserExists" class="profile__empty">Место пустое</div>

        <PersonCard v-else :person="person" />
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import onClickOutside from "@/directives/click-outside";
import LoaderService from "@/services/loader";

import LegendItem from "./SideMenu/LegendItem.vue";
import PersonCard from "./SideMenu/PersonCard.vue";
import Doughnut from "./Doughnut.vue";

import legend from "@/assets/data/legend.json";
import tables from "@/assets/data/tables.json";
import people from "@/assets/data/people.json";

export default {
  name: "SideMenu",

  components: {
    LegendItem,
    PersonCard,
    Draggable: draggable,
    Doughnut,
  },

  directives: { onClickOutside },

  props: {
    person: {
      type: [Object, null],
      default: null,
    },
  },

  data() {
    return {
      legend: [],
      loader: new LoaderService(),
    };
  },

  computed: {
    isUserOpened() {
      return Boolean(this.person);
    },

    isUserExists() {
      return this.person && this.person._id !== undefined;
    },
  },

  created() {
    this.loadLegend();
  },

  methods: {
    async loadLegend() {
      try {
        const data = await this.loader.handleLoading(
          new Promise((res) => {
            setTimeout(() => res({ legend, tables, people }), 1000);
          })
        );

        const tablesByGroup = data.tables.reduce((acc, item) => {
          const isTableOccupied = data.people.find(person => person.tableId === item._id);

          if (Object.prototype.hasOwnProperty.call(acc, item.group_id)) {
            acc[item.group_id] += isTableOccupied ? 1 : 0;
          } else {
            acc[item.group_id] = isTableOccupied ? 1 : 0;
          }

          return acc;
        }, {});

        this.legend = data.legend.map((item) => {
          item.counter = tablesByGroup[item.group_id];

          return item;
        });
      } catch (e) {
        console.warn(e);
      }
    },

    closeProfile() {
      this.$emit("update:person", null);
    },
  },
};
</script>

<style scoped>
.menu {
  border-left: 1px solid #ccd8e4;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar .toolbar__actions button {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  padding: 2px 6px;
}

.toolbar__header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar__header .action {
  cursor: pointer;
  margin-right: 14px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbar__header .action .arrow {
  width: 10px;
  height: 10px;
  border-top: 2px solid blue;
  border-right: 2px solid blue;
  transform: rotate(-135deg);
}

h3 {
  margin: 0;
}

.content {
  flex: 1;
}

.content .legend {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.content .legend .legend__data {
  display: flex;
  height: 100%;
}

.content .legend .legend__items {
  flex: 1;
  width: 100%;
}

.content .legend .legend__items .legend__item:not(:first-child) {
  margin-top: 16px;
}

.content .legend .legend__items .legend__item {
  cursor: pointer;
}

.content .legend .legend__items .legend__item.sortable-chosen {
  opacity: 25%;
}

.content .legend .legend--empty {
  align-self: center;
  width: 100%;
  text-align: center;
}

.profile {
  padding-top: 20px;
}
</style>
