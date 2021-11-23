export default {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Flow draft",
  description: "Input for Flow parser",
  definitions: {
    blockAction: {
      type: "string",
      enum: ["modify", "remove", "freeze", "obfuscate"],
    },
    blockType: {
      type: "string",
      enum: ["text", "image", "link", "button", "list", "composite"],
    },
    block: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        type: {
          $ref: "#/definitions/blockType",
        },
        transient: {
          type: "boolean",
        },
        required: {
          type: "boolean",
        },
        action: {
          $ref: "#/definitions/blockAction",
        },
        selector: {
          type: "string",
        },
        default: {
          type: "string",
        },
      },
      required: ["name", "type", "action", "selector"],
    },
    variableType: {
      type: "string",
      enum: ["text", "image", "collection", "location"],
    },
  },
  type: "object",
  properties: {
    variables: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          type: {
            $ref: "#/definitions/variableType",
          },
          transient: {
            type: "boolean",
          },
          attributes: {
            type: "string",
          },
          hint: {
            type: "string",
          },
          clarification: {
            type: "string",
          },
          default: {
            type: "string",
          },
        },
        required: ["name", "type"],
      },
    },
    globalBlocks: {
      type: "array",
      items: {
        $ref: "#/definitions/block",
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          urlMatching: {
            type: "array",
            items: {
              type: "string",
            },
          },
          instructions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          blocks: {
            type: "array",
            items: {
              $ref: "#/definitions/block",
            },
          },
          repeatingGroups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                start: {
                  type: "number",
                },
                target: {
                  type: "number",
                },
                bodySelector: {
                  type: "string",
                },
                rowSelector: {
                  type: "string",
                },
                cells: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    type: {
                      $ref: "#/definitions/blockType",
                    },
                    action: {
                      $ref: "#/definitions/blockAction",
                    },
                    selector: {
                      type: "string",
                    },
                    default: {
                      type: "string",
                    },
                  },
                  required: ["name", "type", "action", "selector"],
                },
              },
              required: [
                "name",
                "start",
                "target",
                "bodySelector",
                "rowSelector",
                "cells",
              ],
            },
          },
        },
        required: ["name", "urlMatching"],
      },
    },
  },
  required: ["steps"],
};
