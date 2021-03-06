import { actions, send, Machine, MachineConfig, MachineOptions } from "xstate";
import promptMachine from "./prompt.machine";
const { assign } = actions;

const initialAppContextItems = [
  {
    id: 0,
    title: "Summer Photos",
    owner: "Anthony Stevens",
    updatedAt: new Date(Date.UTC(2017, 6, 12)),
  },
  {
    id: 1,
    title: "Surfing",
    owner: "Scott Masterson",
    updatedAt: new Date(Date.UTC(2017, 6, 16)),
  },
  {
    id: 2,
    title: "Beach Concerts",
    owner: "Jonathan Lee",
    updatedAt: new Date(Date.UTC(2017, 1, 16)),
  },
  {
    id: 3,
    title: "Sandcastles",
    owner: "Aaron Bennett",
    updatedAt: new Date(Date.UTC(2017, 5, 5)),
  },
  {
    id: 4,
    title: "Boardwalk",
    owner: "Mary Johnson",
    updatedAt: new Date(Date.UTC(2017, 5, 1)),
  },
  {
    id: 5,
    title: "Beach Picnics",
    owner: "Janet Perkins",
    updatedAt: new Date(Date.UTC(2017, 4, 7)),
  },
];

const initialAppContext = {
  items: initialAppContextItems,
  selectedItems: [],
};

function deleteItems(items) {
  return new Promise(
    (resolve, reject) =>
      setTimeout(
        () => resolve(`${items.length} items deleted succesfully`),
        3000
      )
    //   setTimeout(
    //     () => reject(`Error deleting the ${items.length} selected item(s). Please try again later.`),
    //     3000
    //   )
  );
}

const appMachineConfig = {
  key: "app",
  initial: "browsing",
  context: initialAppContext,
  states: {
    browsing: {
      on: {
        SELECT_ITEM: {
          target: "selecting",
          actions: "addItemToSelection",
        },
        SELECT_ALL_ITEMS: {
          target: "selecting",
          actions: "addAllItemsToSelection",
        },
      },
    },
    selecting: {
      on: {
        SELECT_ITEM: {
          actions: "addItemToSelection",
        },
        SELECT_ALL_ITEMS: {
          actions: "addAllItemsToSelection",
        },
        DESELECT_ITEM: [
          {
            target: "browsing",
            actions: "removeItemFromSelection",
            cond: (ctx) => ctx.selectedItems.length === 1,
          },
          {
            actions: "removeItemFromSelection",
            cond: (ctx) => ctx.selectedItems.length > 1,
          },
        ],
        RESET_SELECTION: {
          target: "browsing",
          actions: "resetSelection",
        },
        DELETE_SELECTION: {
          target: "deleting",
        },
      },
    },
    deleting: {
      invoke: {
        src: (ctx) => deleteItems(ctx.selectedItems),
        onDone: {
          target: "browsing",
          actions: "deleteSelection",
        },
        onError: {
          target: "prompting",
        },
      },
    },
    prompting: {
      invoke: {
        id: "prompt",
        src: promptMachine,
        data: {
          message: (ctx, event) => {
            console.log(ctx, event);
          },
        },
        onDone: "selecting",
      },
      on: {
        DISMISS_PROMPT: {
          actions: send("DISMISS_PROMPT", { to: "prompt" }),
        },
        DELETE_SELECTION: {
          target: "deleting",
        },
      },
    },
  },
};

const appMachineOptions = {
  actions: {
    addItemToSelection: assign((ctx, event) => ({
      selectedItems: ctx.selectedItems.concat(event.item),
    })),
    addAllItemsToSelection: assign((ctx) => ({
      selectedItems: ctx.items,
    })),
    removeItemFromSelection: assign((ctx, event) => ({
      selectedItems: ctx.selectedItems.filter(
        (item) => item.id !== event.item.id
      ),
    })),
    resetSelection: assign((_) => ({
      selectedItems: [],
    })),
    deleteSelection: assign((ctx) => ({
      items: ctx.items.filter(
        (item) =>
          ctx.selectedItems.findIndex(
            (selectedItem) => selectedItem.id === item.id
          ) < 0
      ),
      selectedItems: [],
    })),
  },
};

export default Machine(appMachineConfig, appMachineOptions);
