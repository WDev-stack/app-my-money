import React, { useEffect, useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [saida, setSaida] = useState(0);

  const [historico, setHistorico] = useState(() => {
    if (typeof window !== "undefined") {
      const salvos = localStorage.getItem("minhas_transacoes");
      return salvos ? JSON.parse(salvos) : [];
    }
    return [];
  });

  useEffect(() => {
    let somaTotal = 0;
    let contadorEntrada = 0;
    let contadorSaida = 0;

    historico.forEach((item) => {
      somaTotal += item.valor;
      if (item.valor > 0) {
        contadorEntrada += 1;
      } else {
        contadorSaida += 1;
      }
    });

    setSaldo(somaTotal);
    setEntrada(contadorEntrada);
    setSaida(contadorSaida);

    localStorage.setItem("minhas_transacoes", JSON.stringify(historico));
  }, [historico]);
  
  const adicionarTransacao = async (n, v) => {
    setErro("");
    setLoading(true);
    try {
      const novoItem = {
        id: Date.now(),
        nome: n,
        valor: Number(v),
      };

      if (!novoItem.nome || novoItem.valor === 0) {
        throw new Error("Preencha a descrição e um valor válido!");
      }

      setHistorico((prev) => [novoItem, ...prev]);
      setNome("");
      setValor("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletarItem = (id) => {
    setHistorico(historico.filter((item) => item.id !== id));
  };

  const limparTudo = () => {
    if (window.confirm("Deseja apagar todos os registros?")) {
      setHistorico([]);
      localStorage.removeItem("minhas_transacoes");
    }
  };

  return (
    <div>
      <header>
        <h1>MyMoney Pro</h1>
        <p>Gestão de Finanças Pessoais</p>
      </header>

      <section>
        <div>
          <span>Saldo Atual</span>
          <h2>R$ {saldo.toFixed(2)}</h2>
        </div>
        <div>
          <span>Entradas</span>
          <h2>{entrada}</h2>
        </div>
        <div>
          <span>Saídas</span>
          <h2>{saida}</h2>
        </div>
      </section>

      <form onSubmit={(e) => { e.preventDefault(); adicionarTransacao(nome, valor); }}>
        <input
          placeholder="Descrição"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Valor"
          value={valor}
          type="number"
          onChange={(e) => setValor(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Lançar"}
        </button>
      </form>

      {erro && <div>{erro}</div>}

      <section>
        <div>
          <h3>Histórico Recente</h3>
          {historico.length > 0 && (
            <button onClick={limparTudo}>Limpar Tudo</button>
          )}
        </div>

        <div>
          {historico.length === 0 ? (
            <p>Nenhuma movimentação registrada.</p>
          ) : (
            historico.map((item) => (
              <div key={item.id}>
                <div>
                  <strong>{item.nome}</strong>
                  <small>{new Date(item.id).toLocaleDateString()}</small>
                </div>
                <div>
                  <span>
                    R$ {item.valor.toFixed(2)}
                  </span>
                  <button onClick={() => deletarItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}