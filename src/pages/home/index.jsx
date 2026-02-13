import React, { useEffect, useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [saida, setSaida] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

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
      if (item.valor > 0) contadorEntrada += 1;
      else contadorSaida += 1;
    });

    setSaldo(somaTotal);
    setEntrada(contadorEntrada);
    setSaida(contadorSaida);
    localStorage.setItem("minhas_transacoes", JSON.stringify(historico));
  }, [historico]);

  const prepararEdicao = (item) => {
    setEditandoId(item.id);
    setNome(item.nome);
    setValor(item.valor.toString());
    setErro("");
  };

  const manipularTransacao = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      if (!nome || !valor || Number(valor) === 0) {
        throw new Error("Preencha a descrição e um valor válido!");
      }

      if (editandoId) {
        const historicoAtualizado = historico.map((item) =>
          item.id === editandoId
            ? { ...item, nome: nome, valor: Number(valor) }
            : item
        );
        setHistorico(historicoAtualizado);
        setEditandoId(null);
      } else {
        const novoItem = {
          id: Date.now(),
          nome: nome,
          valor: Number(valor),
        };
        setHistorico((prev) => [novoItem, ...prev]);
      }

      setNome("");
      setValor("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletarItem = (id) => {
    if (editandoId === id) setEditandoId(null);
    setHistorico(historico.filter((item) => item.id !== id));
  };

  const limparTudo = () => {
    if (window.confirm("Deseja apagar todos os registros?")) {
      setHistorico([]);
      setEditandoId(null);
      localStorage.removeItem("minhas_transacoes");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header>
        <h1>MyMoney</h1>
        <p>Gestão de Finanças Pessoais</p>
      </header>

      <section style={{ display: "flex", gap: "20px", background: "#f4f4f4", padding: "15px", borderRadius: "8px" }}>
        <div>
          <span>Saldo Atual</span>
          <h2 style={{ color: saldo >= 0 ? "green" : "red" }}>R$ {saldo.toFixed(2)}</h2>
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

      <hr style={{ margin: "20px 0" }} />

      <h3>{editandoId ? "📝 Editando Registro" : "➕ Nova Transação"}</h3>

      <form onSubmit={manipularTransacao} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          placeholder="Descrição"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          placeholder="Valor (Ex: 10 ou -10)"
          value={valor}
          type="number"
          onChange={(e) => setValor(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px", background: editandoId ? "#2196F3" : "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
        >
          {loading ? "..." : editandoId ? "Salvar Alteração" : "Lançar"}
        </button>

        {editandoId && (
          <button 
            type="button" 
            onClick={() => { setEditandoId(null); setNome(""); setValor(""); }}
            style={{ padding: "10px", background: "#ccc", border: "none", cursor: "pointer" }}
          >
            Cancelar
          </button>
        )}
      </form>

      {erro && <p style={{ color: "red", fontWeight: "bold" }}>{erro}</p>}

      <section style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Histórico Recente</h3>
          {historico.length > 0 && (
            <button onClick={limparTudo} style={{ color: "red", cursor: "pointer", border: "none", background: "none" }}>
              Limpar Tudo
            </button>
          )}
        </div>

        <div>
          {historico.length === 0 ? (
            <p>Nenhuma movimentação registrada.</p>
          ) : (
            historico.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  border: editandoId === item.id ? "2px solid #2196F3" : "1px solid #ddd", 
                  padding: "10px", 
                  margin: "10px 0", 
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong>{item.nome}</strong>
                  <br />
                  <small>{new Date(item.id).toLocaleDateString()}</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: item.valor > 0 ? "green" : "red", fontWeight: "bold" }}>
                    R$ {item.valor.toFixed(2)}
                  </span>
                  <button onClick={() => prepararEdicao(item)} style={{ cursor: "pointer" }}>✏️</button>
                  <button onClick={() => deletarItem(item.id)} style={{ cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}