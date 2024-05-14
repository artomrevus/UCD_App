using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace UCD_Server.Models
{
	public class ApplicationDbContext : DbContext
	{
		public DbSet<Student> Students { get; set; }
   
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
		{
		}
    }
}

