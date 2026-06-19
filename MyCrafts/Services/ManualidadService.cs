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

    public List<Manualidad>? Obtener()
    {
        using var conexion = new ConexionSql();

        var comando = "Select * from Manualidades for json path";

        if (comando == null)
            return [];

        var resComando = conexion.SqlJson(comando);
        var datos = JsonConvert.DeserializeObject<List<Manualidad>>(resComando);
        return datos;
    }
}