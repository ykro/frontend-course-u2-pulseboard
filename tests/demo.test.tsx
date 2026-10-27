// Tests oficiales de la demo. En verde desde el starter.
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ANA, DEMO_PASSWORD } from "../mocks/users";
import { renderApp } from "./helpers";

describe("demo: acceso con Firebase Auth (fake)", () => {
  it("muestra 'Verificando sesión' hasta que Firebase responde y luego el formulario", async () => {
    const app = renderApp("/login", { user: null, deferAuth: true });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Verificando sesión...",
    );
    expect(screen.queryByLabelText("Correo")).not.toBeInTheDocument();

    app.auth.resolveInitialState();

    expect(await screen.findByLabelText("Correo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Inicia sesión en PulseBoard" }),
    ).toBeInTheDocument();
  });

  it("inicia sesión y muestra el correo de la persona en el encabezado", async () => {
    const app = renderApp("/login", { user: null });

    await app.user.type(await screen.findByLabelText("Correo"), ANA.email);
    await app.user.type(screen.getByLabelText("Contraseña"), DEMO_PASSWORD);
    await app.user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText(ANA.email)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
  });
});
