import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { partidosService } from '../services/partidosService';
import { torneosService } from '@/features/torneos/services/torneosService';
import { equiposService } from '@/features/equipos/services/equiposService';
import { useApp } from '@/context/AppContext';
import { formatDate, formatTime } from '@/utils/formatters';

export default function PartidosAdminPage() {
  const [partidos, setPartidos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalPartidoOpen, setIsModalPartidoOpen] = useState(false);
  const [isModalResultadoOpen, setIsModalResultadoOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);

  const { showSuccess, showError } = useApp();

  const [partidoForm, setPartidoForm] = useState({
    id_torneo: '1',
    id_equipo_local: '1',
    id_equipo_visitante: '2',
    fecha: new Date().toISOString().split('T')[0],
    hora: '15:00',
    ronda: 'Fase Regular',
    estado: 'Programado',
  });

  const [resultadoForm, setResultadoForm] = useState({
    puntos_local: 0,
    puntos_visitante: 0,
    observaciones: '',
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [partidosData, torneosData, equiposData] = await Promise.all([
        partidosService.listar(),
        torneosService.listar(),
        equiposService.listar(),
      ]);
      setPartidos(partidosData);
      setTorneos(torneosData);
      setEquipos(equiposData);
    } catch {
      showError('Error al cargar partidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenNewPartido = () => {
    setPartidoForm({
      id_torneo: torneos[0]?.id_torneo ? String(torneos[0].id_torneo) : '1',
      id_equipo_local: equipos[0]?.id_equipo ? String(equipos[0].id_equipo) : '1',
      id_equipo_visitante: equipos[1]?.id_equipo ? String(equipos[1].id_equipo) : '2',
      fecha: new Date().toISOString().split('T')[0],
      hora: '15:00',
      ronda: 'Fase de Grupos',
      estado: 'Programado',
    });
    setIsModalPartidoOpen(true);
  };

  const handleOpenRegistrarResultado = (partido) => {
    setSelectedPartido(partido);
    setResultadoForm({
      puntos_local: partido.resultado?.puntos_local || 0,
      puntos_visitante: partido.resultado?.puntos_visitante || 0,
      observaciones: partido.resultado?.observaciones || '',
    });
    setIsModalResultadoOpen(true);
  };

  const handleCrearPartido = async (e) => {
    e.preventDefault();
    if (partidoForm.id_equipo_local === partidoForm.id_equipo_visitante) {
      showError('El equipo local y visitante no pueden ser el mismo.');
      return;
    }

    try {
      await partidosService.crear({
        id_torneo: Number(partidoForm.id_torneo),
        id_equipo_local: Number(partidoForm.id_equipo_local),
        id_equipo_visitante: Number(partidoForm.id_equipo_visitante),
        fecha: partidoForm.fecha,
        hora: partidoForm.hora + ':00',
        ronda: partidoForm.ronda,
        estado: partidoForm.estado,
      });
      showSuccess('Partido programado con éxito.');
      setIsModalPartidoOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al programar partido.');
    }
  };

  const handleGuardarResultado = async (e) => {
    e.preventDefault();
    try {
      const pLocal = Number(resultadoForm.puntos_local);
      const pVis = Number(resultadoForm.puntos_visitante);
      const idGanador =
        pLocal >= pVis ? selectedPartido.id_equipo_local : selectedPartido.id_equipo_visitante;

      await partidosService.registrarResultado(selectedPartido.id_partido, {
        id_equipo_ganador: idGanador,
        puntos_local: pLocal,
        puntos_visitante: pVis,
        observaciones: resultadoForm.observaciones,
      });

      showSuccess('Resultado guardado y marcador actualizado.');
      setIsModalResultadoOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al registrar resultado.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar la partida #${id}?`)) return;
    try {
      await partidosService.eliminar(id);
      showSuccess('Partida eliminada.');
      cargarDatos();
    } catch {
      showError('No se pudo eliminar la partida.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_partido', align: 'center' },
    {
      header: 'Encuentro / Equipos',
      render: (p) => {
        const eqLocal = equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre || `Eq #${p.id_equipo_local}`;
        const eqVis = equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre || `Eq #${p.id_equipo_visitante}`;
        return (
          <div>
            <strong>{eqLocal}</strong> vs <strong>{eqVis}</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Ronda: {p.ronda || 'General'}</div>
          </div>
        );
      },
    },
    {
      header: 'Torneo',
      render: (p) => {
        const t = torneos.find((tor) => tor.id_torneo === p.id_torneo);
        return t ? t.nombre : `Torneo #${p.id_torneo}`;
      },
    },
    {
      header: 'Horario',
      render: (p) => `${formatDate(p.fecha)} (${formatTime(p.hora)})`,
    },
    {
      header: 'Marcador',
      render: (p) =>
        p.resultado ? (
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
            {p.resultado.puntos_local} - {p.resultado.puntos_visitante}
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)' }}>Por jugar</span>
        ),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (p) => (
        <Badge variant={p.estado === 'Finalizado' ? 'success' : 'warning'}>
          {p.estado}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (p) => (
        <div className="actions-cell">
          <Button variant="primary" size="sm" onClick={() => handleOpenRegistrarResultado(p)}>
            🎯 {p.resultado ? 'Editar Marcador' : 'Cómputo'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(p.id_partido)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Partidas y Marcadores"
      subtitle="Programa partidos entre equipos, registra rondas y computa marcadores y ganadores oficiales."
    >
      <Table
        columns={columns}
        data={partidos}
        loading={loading}
        onAddNew={handleOpenNewPartido}
        addNewLabel="＋ Programar Partido"
        searchPlaceholder="Buscar por equipo, torneo o estado..."
      />

      {/* Modal Programar Partido */}
      <Modal
        isOpen={isModalPartidoOpen}
        onClose={() => setIsModalPartidoOpen(false)}
        title="🎯 Programar Encuentro de Tejo"
      >
        <form onSubmit={handleCrearPartido}>
          <Input
            label="Torneo Asignado"
            type="select"
            value={partidoForm.id_torneo}
            onChange={(e) => setPartidoForm({ ...partidoForm, id_torneo: e.target.value })}
            required
            options={torneos.map((t) => ({
              value: String(t.id_torneo),
              label: t.nombre,
            }))}
          />

          <div className="form-grid-2">
            <Input
              label="Equipo Local (Cancha A)"
              type="select"
              value={partidoForm.id_equipo_local}
              onChange={(e) => setPartidoForm({ ...partidoForm, id_equipo_local: e.target.value })}
              required
              options={equipos.map((e) => ({
                value: String(e.id_equipo),
                label: e.nombre,
              }))}
            />

            <Input
              label="Equipo Visitante (Cancha B)"
              type="select"
              value={partidoForm.id_equipo_visitante}
              onChange={(e) => setPartidoForm({ ...partidoForm, id_equipo_visitante: e.target.value })}
              required
              options={equipos.map((e) => ({
                value: String(e.id_equipo),
                label: e.nombre,
              }))}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Fecha del Partido"
              type="date"
              value={partidoForm.fecha}
              onChange={(e) => setPartidoForm({ ...partidoForm, fecha: e.target.value })}
              required
            />
            <Input
              label="Hora de Inicio"
              type="time"
              value={partidoForm.hora}
              onChange={(e) => setPartidoForm({ ...partidoForm, hora: e.target.value })}
              required
            />
          </div>

          <Input
            label="Ronda / Fase"
            value={partidoForm.ronda}
            onChange={(e) => setPartidoForm({ ...partidoForm, ronda: e.target.value })}
            placeholder="Ej. Cuartos de Final, Semifinal, Final..."
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalPartidoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar y Programar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Resultado */}
      <Modal
        isOpen={isModalResultadoOpen}
        onClose={() => setIsModalResultadoOpen(false)}
        title={`🎯 Cómputo de Marcador (Partida #${selectedPartido?.id_partido})`}
      >
        <form onSubmit={handleGuardarResultado}>
          <div className="form-grid-2">
            <Input
              label="Puntos Equipo Local"
              type="number"
              value={resultadoForm.puntos_local}
              onChange={(e) => setResultadoForm({ ...resultadoForm, puntos_local: e.target.value })}
              min="0"
              required
            />
            <Input
              label="Puntos Equipo Visitante"
              type="number"
              value={resultadoForm.puntos_visitante}
              onChange={(e) => setResultadoForm({ ...resultadoForm, puntos_visitante: e.target.value })}
              min="0"
              required
            />
          </div>

          <Input
            label="Observaciones del Árbitro / Mechas registradas"
            type="textarea"
            value={resultadoForm.observaciones}
            onChange={(e) => setResultadoForm({ ...resultadoForm, observaciones: e.target.value })}
            placeholder="Mechas, embocadas, moñonas, incidencias en campo..."
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalResultadoOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Registrar Resultado Oficial
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
