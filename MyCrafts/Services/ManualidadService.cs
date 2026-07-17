using MyCrafts.Api;
using MyCrafts.Models;
using Newtonsoft.Json;

namespace MyCrafts.Services;

public class ManualidadService
{
    public string Guardar(ManualidadRequest manualidad)
    {
        try
        {
            using var conexion = new ConexionSql();

            string sql = @$"

            INSERT INTO Manualidades
            (
                Titulo,
                Categoria,
                Descripcion,
                ImagenBase64,
                FechaCreacion
            )
            VALUES
            (
                '{manualidad.Titulo}',
                '{manualidad.Categoria}',
                '{manualidad.Descripcion}',
                '{manualidad.ImagenBase64}',
                GETDATE()
            )";

            var resGuarda = conexion.SqlQuerySingle(sql);
            return resGuarda;
        }
        catch (Exception ex)
        {
            return ex.Message;
        }
    }

    public List<Manualidad>? Obtener(int? cantidad = null)
    {
        using var conexion = new ConexionSql();

        // Si se indica una cantidad, solo se traen las mas recientes (ej: las ultimas 4)
        var top = (cantidad.HasValue && cantidad.Value > 0)
            ? $"TOP ({cantidad.Value}) "
            : "";

        var comando = $"SELECT {top}* FROM Manualidades ORDER BY FechaCreacion DESC, Id DESC FOR JSON PATH";

        var resComando = conexion.SqlJson(comando);
        var datos = JsonConvert.DeserializeObject<List<Manualidad>>(resComando);
        return datos ?? [];
    }
}