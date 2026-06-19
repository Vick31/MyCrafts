using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Text;

namespace MyCrafts.Api;

public class ConexionSql : IDisposable
{
    public static bool EnableLogs { get; set; }
    private readonly string _server;
    private readonly string _database;
    private readonly string _user;
    private readonly string _pass;

    public SqlConnection Con { get; private set; }
    public SqlTransaction? Tran { get; private set; }

    public string Cadena => $"Data Source={_server};Database={_database};User ID={_user};Password={_pass};TrustServerCertificate=True;";

    public ConexionSql(
        string? servidor,
        string? baseDeDatos,
        string? usuario,
        string? contraseña)
    {
        servidor ??= @"LOCALHOST\CRAFTS";
        //servidor ??= @"dev-manuel\samit";
        baseDeDatos ??= "CRAFTS";
        usuario ??= "sa";
        contraseña ??= "2121121512";

        _server = servidor;
        _database = baseDeDatos;
        _user = usuario;
        _pass = contraseña;

        Con = new SqlConnection(Cadena);
        Con.Open();

        using var comando = Con.CreateCommand();
        comando.CommandText = "SET DATEFORMAT DMY;";
        comando.ExecuteNonQuery();
    }

    public ConexionSql(
        string? servidor,
        string? baseDeDatos)

        : this(
            servidor,
            baseDeDatos,
            null,
            null)
    {
    }

    public ConexionSql()

        : this(
            null,
            null,
            null,
            null)
    {
    }

    public void CambiarBaseDatos(
        string nuevaBaseDeDatos)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                $"CambiarBaseDatos: {nuevaBaseDeDatos}");
        }

        Con.ChangeDatabase(nuevaBaseDeDatos);
    }

    public void CerrarConexion()
    {
        Con.Close();

        Con.Dispose();
    }

    public void IniciarTransaccion()
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "IniciarTransaccion");
        }

        Tran =
            Con.BeginTransaction(
                IsolationLevel.ReadCommitted);
    }

    public void CompletarTransaccion()
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "CompletarTransaccion");
        }

        Tran?.Commit();
    }

    public void ReversarTransaccion()
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "ReversarTransaccion");
        }

        try
        {
            Tran?.Rollback();
        }
        catch
        {
        }
    }

    public SqlConnection Connection()
    {
        return Con;
    }

    public string SqlJson(
        string comando)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "SqlJson");
        }

        using var cmd =
            new SqlCommand(
                $"SET DATEFORMAT DMY; {comando}",
                Con,
                Tran);

        var json =
            new StringBuilder();

        using var reader =
            cmd.ExecuteReader();

        if (!reader.HasRows)
        {
            return "[]";
        }

        while (reader.Read())
        {
            json.Append(
                reader.GetValue(0));
        }

        return json.ToString();
    }

    public DataTable? SqlQuery(
        string sql)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "SqlQuery");
        }

        using var comando =
            new SqlCommand(
                sql,
                Con,
                Tran);

        using var adapter =
            new SqlDataAdapter(
                comando);

        var tabla =
            new DataTable();

        try
        {
            adapter.Fill(tabla);

            return tabla;
        }
        catch
        {
            return null;
        }
    }

    public string SqlQuerySingle(
        string sql,
        bool incluirDmy = true,
        int? tiempoEspera = null)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                $"SqlQuerySingle: {sql}");
        }

        if (incluirDmy)
        {
            sql =
                $"SET DATEFORMAT DMY; {sql}";
        }

        using var comando =
            new SqlCommand(
                sql,
                Con,
                Tran);

        if (tiempoEspera.HasValue)
        {
            comando.CommandTimeout =
                tiempoEspera.Value;
        }

        try
        {
            var filas =
                comando.ExecuteNonQuery();

            return filas > 0
                ? "si"
                : "no";
        }
        catch (Exception ex)
        {
            return ex.Message;
        }
    }

    public int SqlQuerySingleRows(
        string sql)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                $"SqlQuerySingleRows: {sql}");
        }

        using var comando =
            new SqlCommand(
                sql,
                Con,
                Tran);

        try
        {
            return comando.ExecuteNonQuery();
        }
        catch
        {
            return 0;
        }
    }

    public int SqlQueryReturnId(
        string sql,
        bool agregaReturnId)
    {
        if (EnableLogs)
        {
            Debug.WriteLine(
                "SqlQueryReturnId");
        }

        sql =
            $"SET DATEFORMAT DMY; {sql}";

        if (agregaReturnId)
        {
            sql +=
                "; SELECT CAST(SCOPE_IDENTITY() AS INT)";
        }

        using var comando =
            new SqlCommand(
                sql,
                Con,
                Tran);

        try
        {
            var resultado =
                comando.ExecuteScalar();

            return resultado is null
                ? 0
                : Convert.ToInt32(resultado);
        }
        catch
        {
            return 0;
        }
    }

    public void Dispose()
    {
        Tran?.Dispose();

        Con?.Dispose();
    }
}