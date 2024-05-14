using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UCD_Server.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;



namespace UCD_Server.Controllers
{
    [EnableCors("StudentsPolicy")]
    public class StudentsController : Controller
    {
        private readonly ApplicationDbContext _context;


        public StudentsController(ApplicationDbContext context)
        {
            _context = context;
            var lastAddedStudent = _context.Students.ToList().LastOrDefault();
            if (lastAddedStudent is not null)
            {
                Student.SetLastAddedStudentId(lastAddedStudent.Id);
            }
        }


        public string Index()
        {
            return "Welcome from UCD server";
        }


        [HttpPost]
        [Route("/Students/AddStudent")]
        public async Task<string> AddStudent([FromBody] Student postRequestStudent)
        {
            string?[] errorsArray = Student.GetErrorsArrayForInvalidFieldsOrNullsOtherwise(
                postRequestStudent.Group,
                postRequestStudent.FirstName,
                postRequestStudent.LastName,
                postRequestStudent.Gender,
                postRequestStudent.Birthday
            );


            if (errorsArray.Any(res => res is not null))
            {
                return JsonSerializer.Serialize(
                    new Response(
                        false,
                        new { code = 400, message = string.Join("&&", errorsArray) },
                        null
                    )
                );
            }
            else
            {
                Student newStudent = new Student(
                    postRequestStudent.Group,
                    postRequestStudent.FirstName,
                    postRequestStudent.LastName,
                    postRequestStudent.Gender,
                    postRequestStudent.Birthday
                );

                _context.Students.Add(newStudent);
                await _context.SaveChangesAsync();

                return JsonSerializer.Serialize(
                    new Response(
                        true,
                        new { code = 200, message = "All data is valid! Student added!" },
                        newStudent
                    )
                );
            }
        }


        [HttpPost]
        [Route("/Students/EditStudent")]
        public async Task<string> EditStudent([FromBody] Student postRequestStudent)
        {
            var errorsArray = Student.GetErrorsArrayForInvalidFieldsOrNullsOtherwise(
                postRequestStudent.Group,
                postRequestStudent.FirstName,
                postRequestStudent.LastName,
                postRequestStudent.Gender,
                postRequestStudent.Birthday
            );

            if (errorsArray.Any(res => res is not null))
            {
                return JsonSerializer.Serialize(
                    new Response(
                        false,
                        new { code = 400, message = string.Join("&&", errorsArray) },
                        null
                    )
                );
            }
            else
            {
                var editedStudent = await _context.Students.FindAsync(postRequestStudent.Id);
                if (editedStudent == null)
                {
                    return JsonSerializer.Serialize(
                        new Response(
                            false,
                            new { code = 400, message = "Student not found!" },
                            null
                        )
                    );
                }

                editedStudent.Group = postRequestStudent.Group;
                editedStudent.FirstName = postRequestStudent.FirstName;
                editedStudent.LastName = postRequestStudent.LastName;
                editedStudent.Gender = postRequestStudent.Gender;
                editedStudent.Birthday = postRequestStudent.Birthday;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return JsonSerializer.Serialize(
                        new Response(
                            false,
                            new { code = 500, message = "Concurrency error occurred while saving changes!" },
                            null
                        )
                    );
                }

                return JsonSerializer.Serialize(
                    new Response(
                        true,
                        new { code = 200, message = "All data is valid!" },
                        editedStudent
                    )
                );
            }
        }


        [HttpDelete]
        public async Task<string> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return JsonSerializer.Serialize(
                        new Response(
                            false,
                            new { code = 400, message = "Student not found!" },
                            null
                        )
                    );
            }

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return JsonSerializer.Serialize(
                        new Response(
                            true,
                            new { code = 200, message = "Student successfully deleted!" },
                            null
                        )
                    );
        }


        [HttpGet]
        [Route("/Students/GetAllStudents")]
        public async Task<string> GetAllStudents()
        {
            return JsonSerializer.Serialize(
                new Response(
                    true,
                    new { code = 200, message = "Created students sent successfully!" },
                    await _context.Students.ToListAsync()
                )
            );
        }

    }
}
