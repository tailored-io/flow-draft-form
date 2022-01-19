import SCHEMA from "./schema.json" assert { type: "json" };

// parse url -> merge options -> refreshUI() -> initJsoneditor() -> direct link

/* ------------------------------------------------------------------- data */

let data = {};
let jsoneditor = null;
const jsonEditorForm = document.querySelector("#json-editor-form");

const defaultOptions = {
  object_layout: "grid",
  schema: SCHEMA,
  show_errors: "interaction",
  enable_array_copy: true,
  disable_edit_json: true,
  disable_properties: true,
  no_additional_properties: true,
  theme: "bootstrap3",
  iconlib: "fontawesome5",
};

const directLink = document.querySelector("#direct-link");
directLink.addEventListener("click", () =>
  navigator.clipboard.writeText(window.location.href)
);

const validateTextarea = document.querySelector("#validate-textarea");

const outputTextarea = document.querySelector("#output-textarea");
function setOutputTextArea(value) {
  outputTextarea.value = value ? JSON.stringify(value, null, 2) : "";
  data.output = value;
}

const copyOutput = document.querySelector("#copyoutput");
copyOutput.addEventListener("click", () =>
  navigator.clipboard.writeText(outputTextarea.value)
);

const setValue = document.querySelector("#setvalue");
setValue.addEventListener("click", () => {
  jsoneditor.setValue(JSON.parse(outputTextarea.value));
});

function parseUrl() {
  const url = window.location.search;

  const queryParamsString = url.substring(1, url.length);
  const queryParams = queryParamsString.split("&");

  if (queryParamsString.length) {
    for (const queryParam of queryParams) {
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
    }
  }

  mergeOptions();
}

function mergeOptions() {
  data.options = Object.assign(defaultOptions, data.options);
  refreshUI();
}

function refreshUI() {
  // output
  setOutputTextArea(data.output);

  initJsoneditor();
}

function initJsoneditor() {
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
  jsoneditor.on("change", () => {
    setOutputTextArea(jsoneditor.getValue());

    // validate
    const validationErrors = jsoneditor.validate();
    if (validationErrors.length) {
      validateTextarea.value = JSON.stringify(validationErrors, null, 2);
    } else {
      validateTextarea.value = "No validation errors";
    }

    updateLocation();
  });
}

function updateLocation() {
  const { options, ...dataToSave } = data;
  const dataString = LZString.compressToBase64(JSON.stringify(dataToSave));

  const url = `${window.location.href.replace(/\?.*/, "")}?data=${dataString}`;

  window.history.replaceState(null, "", url);
}

let flows;
const flowForm = document.querySelector("#flow-form");
const flowDropdown = document.querySelector("#flow-dropdown");
flowDropdown.addEventListener("change", (e) => {
  const flow = flows.get(e.target.value);
  setOutputTextArea(flow);
});

const loginForm = document.querySelector("#login-form");
const envSelect = document.querySelector("#env-select");
const usernameField = document.querySelector("#username");
const passwordField = document.querySelector("#password");
const loginButton = document.querySelector("#login");
loginButton.addEventListener("click", async () => {
  loginButton.setAttribute("disabled", "");

  try {
    const apiUrl = envSelect.options[envSelect.selectedIndex].value + "/api";
    const loginUrl = apiUrl + "/login";
    const username = usernameField.value;
    const password = passwordField.value;
    const jsonMimeType = "application/json";
    const credentials = await (
      await fetch(loginUrl, {
        method: "POST",
        headers: {
          Accept: jsonMimeType,
          "Content-Type": jsonMimeType,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })
    ).json();

    const flowsUrl = new URL(apiUrl + "/flows");
    flowsUrl.searchParams.append("partial", "FLOW_LIST");
    flowsUrl.searchParams.append("status", "DRAFT");
    const flowResponse = await (
      await fetch(flowsUrl.toString(), {
        method: "GET",
        headers: {
          Accept: jsonMimeType,
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": jsonMimeType,
        },
      })
    ).json();

    flows = new Map(flowResponse.items.map((f) => [f.id, f]));

    for (const flow of flows.values()) {
      const option = document.createElement("option");
      option.text = `${flow.name} (${flow.baseUrl})`;
      option.value = flow.id;

      flowDropdown.append(option);
    }

    loginForm.style.display = "none";
    flowForm.style.display = "block";
  } catch (e) {
    console.error(`Error fetching data`, e);
    loginButton.removeAttribute("disabled");
  }
});

parseUrl();
