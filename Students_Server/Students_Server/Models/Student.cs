using System;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace UCD_Server.Models
{
	public record Student 
	{
        private static int _idCounter = 0;

        public int? Id { get; init; }
        public string? Group { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public string? Birthday { get; set; }
        public int? IsActive { get; set; }

        public Student()
        {
            Id = -1;
            Group = "undefined group";
            FirstName = "undefined first name";
            LastName = "undefined last name";
            Gender = "undefined gender";
            Birthday = "undefined birthday";
        }

        public Student(string? group, string? firstName, string? lastName, string? gender, string? birthday)
        {
            var validationResult = GetErrorsArrayForInvalidFieldsOrNullsOtherwise(group, firstName, lastName, gender, birthday);
            if (validationResult.Any(res => res is not null))
            {
                throw new ArgumentException(string.Join("&&", validationResult));
            }

            Id = ++_idCounter;

            Group = group;
            FirstName = firstName;
            LastName = lastName;
            Gender = gender;
            Birthday = birthday;
        }

        public static string?[] GetErrorsArrayForInvalidFieldsOrNullsOtherwise(string? group, string? firstName, string? lastName, string? gender, string? birthday)
        {
            string? groupValidationResult = GetNullIfGroupValidOrErrorOthervise(group);
            string? firstNameValidationResult = GetNullIfNameValidOrErrorOthervise(firstName);
            string? lastNameValidationResult = GetNullIfNameValidOrErrorOthervise(lastName);
            string? genderValidationResult = GetNullIfGenderValidOrErrorOthervise(gender);
            string? birthdayValidationResult = GetNullIfBirthdayValidOrErrorOthervise(birthday);

            return new string?[]
            {
                groupValidationResult,
                firstNameValidationResult,
                lastNameValidationResult,
                genderValidationResult,
                birthdayValidationResult
            };
        }


        private static string? GetNullIfGroupValidOrErrorOthervise(string? group)
        {
            if (string.IsNullOrEmpty(group))
            { 
                return "Please select your group";
            }
            else
            {
                return null;
            }
        }


        private static string? GetNullIfNameValidOrErrorOthervise(string? firstName)
        {
            if (string.IsNullOrEmpty(firstName) || firstName.Length > 100 || !System.Text.RegularExpressions.Regex.IsMatch(firstName, @"^[a-zA-Z]*$"))
            {
                return "Invalid input. This field can only contain letters a-z (A-Z) and must have length between 1 and 100.";
            }
            else
            { 
                return null;
            }
        }

        private static string? GetNullIfGenderValidOrErrorOthervise(string? gender)
        {
            if (string.IsNullOrEmpty(gender))
            {
                return "Please select your gender";
            }
            else
            {
                return null;
            }
        }

        private static string? GetNullIfBirthdayValidOrErrorOthervise(string? birthday)
        {
            if(string.IsNullOrEmpty(birthday))
            {
                return "This field cannot be empty";
            }

            var splitedBirthday = birthday.Split('-');
            if(splitedBirthday is not null)
            {
                int.TryParse(splitedBirthday[0], out int year);
                int.TryParse(splitedBirthday[1], out int month);
                int.TryParse(splitedBirthday[2], out int day);

                if (new DateTime(year, month, day) > DateTime.Now)
                {
                    return "This field cannot contain a date in the future";
                }
            }

            return null;
        }

        public static void SetLastAddedStudentId(int? lastId)
        {
            _idCounter = lastId is null ? 0 : (int)lastId;
        }

    }
}

