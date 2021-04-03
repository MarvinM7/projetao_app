const estadoInicial = {
    usuarioAtual: null
}

export const Usuario = (state = estadoInicial, acao) => {
    return {
        ...state,
        usuarioAtual: acao.usuarioAtual
    }
}