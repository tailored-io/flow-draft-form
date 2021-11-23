import SCHEMA from "./schema.js";

// parse url -> merge options -> refreshUI() -> initJsoneditor() -> direct link

/* ------------------------------------------------------------------- data */

let data = {};

const defaultOptions = {
  object_layout: "grid",
  schema: SCHEMA,
  show_errors: "interaction",
  enable_array_copy: true,
  disable_edit_json: true,
  disable_properties: true,
  theme: "bootstrap3",
  iconlib: "fontawesome5",
};

let jsoneditor = null;
const directLink = document.querySelector("#direct-link");

const booleanOptionsSelect = document.querySelector("#boolean-options-select");
const head = document.getElementsByTagName("head")[0];
const iconlibSelect = document.querySelector("#iconlib-select");
const iconlibLink = document.querySelector("#iconlib-link");
const libSelect = document.querySelector("#lib-select");
const jsonEditorForm = document.querySelector("#json-editor-form");
const objectLayoutSelect = document.querySelector("#object-layout-select");
const outputTextarea = document.querySelector("#output-textarea");
const schemaTextarea = document.querySelector("#schema-textarea");
const setSchema = document.querySelector("#setschema");
const setValue = document.querySelector("#setvalue");
const showErrorsSelect = document.querySelector("#show-errors-select");
const themeSelect = document.querySelector("#theme-select");
const themeLink = document.querySelector("#theme-link");
const validateTextarea = document.querySelector("#validate-textarea");

function setOutputTextArea(value) {
  outputTextarea.value = value ? JSON.stringify(value, null, 2) : "";
  data.output = value;
}

/* -------------------------------------------------------------- parse url */

const parseUrl = function () {
  const url = window.location.search;

  const queryParamsString = url.substring(1, url.length);
  const queryParams = queryParamsString.split("&");

  if (queryParamsString.length) {
    queryParams.forEach(function (queryParam) {
      const splittedParam = queryParam.split("=");
      const param = splittedParam[0];
      const value = splittedParam[1];

      // data query param
      if (param === "data") {
        // compress schema and value
        try {
          data = JSON.parse(LZString.decompressFromBase64(value));
          console.info("Parsed data", data);
        } catch (reason) {
          console.error("Error parsing data", reason);
        }
      }
    });
  }

  mergeOptions();
};

/* ----------------------------------------------------------- mergeOptions */

const mergeOptions = function () {
  data.options = Object.assign(defaultOptions, data.options);
  refreshUI();
};

/* -------------------------------------------------------------- refreshUI */

const refreshUI = function () {
  // schema
  schemaTextarea.value = JSON.stringify(data.options.schema, null, 2);

  // output
  setOutputTextArea(data.output);

  // theme
  const themeMap = {
    barebones: "",
    bootstrap3:
      "https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css",
    bootstrap4:
      "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    html: "",
    spectre: "https://unpkg.com/spectre.css/dist/spectre.min.css",
    tailwind: "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css",
  };
  themeLink.href = themeMap[data.options.theme];
  themeSelect.value = data.options.theme;

  // iconlLib
  const iconLibMap = {
    fontawesome3:
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/3.2.1/css/font-awesome.css",
    fontawesome4:
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css",
    fontawesome5: "https://use.fontawesome.com/releases/v5.6.1/css/all.css",
    jqueryui:
      "https://code.jquery.com/ui/1.10.3/themes/south-street/jquery-ui.css",
    openiconic:
      "https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic.min.css",
    spectre: "https://unpkg.com/spectre.css/dist/spectre-icons.min.css",
  };
  iconlibLink.href = iconLibMap[data.options.iconlib];
  iconlibSelect.value = data.options.iconlib;

  // object_layout
  objectLayoutSelect.value = data.options.object_layout;

  // show_errors
  showErrorsSelect.value = data.options.show_errors;

  // boolean values
  const booleanOptions = booleanOptionsSelect.children;
  for (let i = 0; i < booleanOptions.length; i++) {
    const booleanValue = booleanOptions[i];
    if (data.options[booleanValue.value]) {
      booleanValue.selected = true;
    }
  }

  // libs
  const libMapping = {
    ace_editor: {
      js: [
        "https://cdn.jsdelivr.net/npm/ace-editor-builds@1.2.4/src-min-noconflict/ace.js",
      ],
      css: [],
    },
    choices: {
      js: [
        "https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css",
      ],
    },
    cleavejs: {
      js: ["https://cdn.jsdelivr.net/npm/cleave.js@1.4.7/dist/cleave.min.js"],
      css: [],
    },
    sceditor: {
      js: [
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/sceditor.min.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/formats/bbcode.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/formats/xhtml.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/themes/default.min.css",
      ],
    },
    simplemde: {
      js: ["https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"],
      css: ["https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css"],
    },
    select2: {
      js: [
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
        "https://cdn.jsdelivr.net/npm/select2@4.0.6-rc.1/dist/js/select2.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/select2@4.0.6-rc.1/dist/css/select2.min.css",
      ],
    },
    selectize: {
      js: [
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/js/standalone/selectize.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/css/selectize.min.css",
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/css/selectize.default.min.css",
      ],
    },
    flatpickr: {
      js: ["https://cdn.jsdelivr.net/npm/flatpickr"],
      css: ["https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"],
    },
    signature_pad: {
      js: [
        "https://cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js",
      ],
      css: [],
    },
    mathjs: {
      js: ["https://cdn.jsdelivr.net/npm/mathjs@5.3.1/dist/math.min.js"],
      css: [],
    },
  };

  if (data.selectedLibs || data.unselectedLibs) {
    const booleanOptions = booleanOptionsSelect.children;
    for (let i = 0; i < booleanOptions.length; i++) {
      const booleanValue = booleanOptions[i];
      if (data.options[booleanValue.value]) {
        booleanValue.selected = true;
      }
    }

    const libSelectChildren = libSelect.children;
    for (let i = 0; i < libSelectChildren.length; i++) {
      const child = libSelectChildren[i];
      child.selected = data.selectedLibs.includes(child.value);
    }

    // remove libraries
    data.unselectedLibs.forEach(function (selectedLib) {
      const concat = libMapping[selectedLib].js.concat(
        libMapping[selectedLib].css
      );
      concat.forEach(function () {
        const className = ".external_" + selectedLib;
        const toRemove = head.querySelector(className);
        if (toRemove) {
          toRemove.parentNode.removeChild(toRemove);
        }
      });
    });

    // add libraries
    data.selectedLibs.forEach(function (selectedLib) {
      // add js
      libMapping[selectedLib].js.forEach(function (js) {
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = js;
        scriptElement.async = false;
        scriptElement.classList.add("external_" + selectedLib);
        head.appendChild(scriptElement);
      });
      // add css
      libMapping[selectedLib].css.forEach(function (css) {
        const linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("type", "text/css");
        linkElement.setAttribute("href", css);
        linkElement.classList.add("external_" + selectedLib);
        head.appendChild(linkElement);
      });
    });
  }

  initJsoneditor();
};

/* --------------------------------------------------------- initJsoneditor */

const initJsoneditor = function () {
  // destroy old JSONEditor instance if exists
  if (jsoneditor) {
    jsoneditor.destroy();
  }

  // new instance of JSONEditor
  jsoneditor = new window.JSONEditor(jsonEditorForm, data.options);

  if (data.output) {
    jsoneditor.setValue(data.output);
  }

  // listen for changes
  jsoneditor.on("change", function () {
    setOutputTextArea(jsoneditor.getValue());

    // validate
    const validationErrors = jsoneditor.validate();
    if (validationErrors.length) {
      validateTextarea.value = JSON.stringify(validationErrors, null, 2);
    } else {
      validateTextarea.value = "valid";
    }
  });

  updateDirectLink();
};

/* ------------------------------------------------------- updateDirectLink */

const updateDirectLink = function () {
  const dataToSave = JSON.parse(JSON.stringify(data));
  dataToSave.options.schema = undefined;
  const dataString = LZString.compressToBase64(JSON.stringify(dataToSave));

  const url = `${window.location.href.replace(/\?.*/, "")}?data=${dataString}`;

  navigator.clipboard.writeText(url);

  directLink.href = url;
};

/* -------------------------------------------------------- event listeners */

setValue.addEventListener("click", function () {
  jsoneditor.setValue(JSON.parse(outputTextarea.value));
});

setSchema.addEventListener("click", function () {
  try {
    data.options.schema = JSON.parse(schemaTextarea.value);
  } catch (e) {
    alert("Invalid Schema: " + e.message);
    return;
  }
  refreshUI();
});

themeSelect.addEventListener("change", function () {
  data.options.theme = this.value || "";
  refreshUI();
});

iconlibSelect.addEventListener("change", function () {
  data.options.iconlib = this.value || "";
  refreshUI();
});

objectLayoutSelect.addEventListener("change", function () {
  data.options.object_layout = this.value || "";
  refreshUI();
});

showErrorsSelect.addEventListener("change", function () {
  data.options.show_errors = this.value || "";
  refreshUI();
});

booleanOptionsSelect.addEventListener("change", function () {
  const booleanOptions = this.children;
  for (let i = 0; i < booleanOptions.length; i++) {
    data.options[booleanOptions[i].value] = booleanOptions[i].selected;
  }
  refreshUI();
});

libSelect.addEventListener("change", function () {
  data.selectedLibs = [];
  data.unselectedLibs = [];

  const libs = this.children;

  for (let i = 0; i < libs.length; i++) {
    if (libs[i].selected) {
      data.selectedLibs.push(libs[i].value);
    } else {
      data.unselectedLibs.push(libs[i].value);
    }
  }
  refreshUI();
});

parseUrl();
