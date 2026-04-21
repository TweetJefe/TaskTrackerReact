import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          main: {
            value: { base: "#FFFFFF", _dark: "#1A1A1A" }
          },
          card: {
            value: { base: "#F5F5F5", _dark: "#242424" }
          },
          sidebar: {
            value: { base: "#F0F0F0", _dark: "#121212" }
          },
          input: {
            value: { base: "#FFFFFF", _dark: "#1A1A1A" }
          }
        },
        fg: {
          main: {
            value: { base: "#000000", _dark: "#FFFFFF" }
          },
          muted: {
            value: { base: "#666666", _dark: "rgba(255, 255, 255, 0.6)" }
          },
          subtle: {
            value: { base: "#999999", _dark: "rgba(255, 255, 255, 0.4)" }
          }
        },
        border: {
          subtle: {
            value: { base: "rgba(0, 0, 0, 0.08)", _dark: "rgba(255, 255, 255, 0.08)" }
          },
          strong: {
            value: { base: "rgba(0, 0, 0, 0.2)", _dark: "rgba(255, 255, 255, 0.2)" }
          }
        }
      }
    }
  }
})

export const system = createSystem(defaultConfig, config)
