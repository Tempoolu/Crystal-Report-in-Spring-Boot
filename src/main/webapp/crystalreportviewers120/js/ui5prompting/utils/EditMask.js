var EditMask = function () {
};

EditMask.MASK_VALUE_PASSWORD = "PASSWORD";
EditMask.MASK_VALUE_PASSWORD2 = "*";
EditMask.MASK_NUMERIC = '0';
EditMask.MASK_NUMERICOPT = '9';
EditMask.MASK_NUMERICSYMOPT = '#';
EditMask.MASK_ALPHA = 'L';
EditMask.MASK_ALPHAOPT = '?';
EditMask.MASK_ALPHANUM = 'A';
EditMask.MASK_ALPHANUMOPT = 'a';
EditMask.MASK_ASCII = '&';
EditMask.MASK_ASCIIOPT = 'C';
EditMask.MASK_DIR_UPPERCASE = '>';
EditMask.MASK_DIR_LOWERCASE = '<';
EditMask.MASK_DIR_LITERAL = '\\';
EditMask.PLUS_SIGN = '+';
EditMask.MINUS_SIGN = '-';
EditMask.DEFAULT_BLANK = '_';

EditMask.isPasswordMask = function (mask) {
  if (mask == null)
    return false;

  var upMask = mask.toUpperCase();
  return upMask == EditMask.MASK_VALUE_PASSWORD || upMask == EditMask.MASK_VALUE_PASSWORD2;
};
EditMask.isValidString = function (mask, stringValue) {
  return EditMask.getValidString(mask, stringValue) != null;
};
EditMask.getValidString = function (mask, stringValue) {
  if (stringValue == null)
    return null;

  if (mask == null || EditMask.isPasswordMask(mask) || mask.length == 0)
    return stringValue;

  var maskLength = mask.length;
  var stringLength = stringValue.length;
  var stringBuffer = "";

  // Length of string cannot be larger than the length of the mask
  if (maskLength < stringLength)
    return null;

  var maskIndex = 0;
  var toUpperCase = false;
  var toLowerCase = false;

  for (var i = 0; i < stringLength; i++) {
    var strCharacter = stringValue.charAt(i);

    if (maskIndex >= maskLength)
      return null;

    var maskCharacter = mask.charAt(maskIndex++);

    while (maskCharacter == EditMask.MASK_DIR_UPPERCASE || maskCharacter == EditMask.MASK_DIR_LOWERCASE) {
      if (maskCharacter == EditMask.MASK_DIR_UPPERCASE) {
        toUpperCase = true;
        toLowerCase = false;
      }

      if (maskCharacter == EditMask.MASK_DIR_LOWERCASE) {
        toLowerCase = true;
        toUpperCase = false;
      }

      if (maskIndex >= maskLength)
        break;

      maskCharacter = mask.charAt(maskIndex++);
    }

    if (maskCharacter == EditMask.MASK_DIR_LITERAL) {
      if (maskIndex >= maskLength)
        return null;

      var literalCharacter = mask.charAt(maskIndex++);
      if (literalCharacter != strCharacter)
        return null;

      stringBuffer += strCharacter;
      continue;
    }

    var valid = false;
    var isFirstChar = (i == 0);

    switch (maskCharacter) {
      case EditMask.MASK_NUMERIC:
        {
          valid = EditMask.isDigit(strCharacter);
          break;
        }
      case EditMask.MASK_NUMERICOPT:
        {
          valid = EditMask.isDigit(strCharacter) || EditMask.isSpaceChar(strCharacter) ||
            (!isFirstChar && strCharacter == EditMask.DEFAULT_BLANK); // first character cannot be blank
          break;
        }
      case EditMask.MASK_NUMERICSYMOPT:
        {
          valid = EditMask.isDigit(strCharacter) || EditMask.isSpaceChar(strCharacter) ||
            strCharacter == EditMask.PLUS_SIGN || strCharacter == EditMask.MINUS_SIGN ||
            (!isFirstChar && strCharacter == EditMask.DEFAULT_BLANK);
          break;
        }
      case EditMask.MASK_ALPHA:
        {
          if (EditMask.isLetter(strCharacter)) {
            valid = true;
            if (toUpperCase) {
              strCharacter = strCharacter.toUpperCase();
            }
            if (toLowerCase) {
              strCharacter = strCharacter.toLowerCase();
            }
          }
          break;
        }
      case EditMask.MASK_ALPHAOPT:
        {
          if (EditMask.isLetter(strCharacter)) {
            valid = true;
            if (toUpperCase) {
              strCharacter = strCharacter.toUpperCase();
            }
            if (toLowerCase) {
              strCharacter = strCharacter.toLowerCase();
            }
          }
          valid = valid || (!isFirstChar && strCharacter == EditMask.DEFAULT_BLANK);
          break;
        }
      case EditMask.MASK_ALPHANUM:
        {
          if (EditMask.isLetter(strCharacter)) {
            valid = true;
            if (toUpperCase) {
              strCharacter = strCharacter.toUpperCase();
            }
            if (toLowerCase) {
              strCharacter = strCharacter.toLowerCase();
            }
          }
          valid = valid || EditMask.isDigit(strCharacter);
          break;
        }
      case EditMask.MASK_ALPHANUMOPT:
        {
          if (EditMask.isLetter(strCharacter)) {
            valid = true;
            if (toUpperCase) {
              strCharacter = strCharacter.toUpperCase();
            }
            if (toLowerCase) {
              strCharacter = strCharacter.toLowerCase();
            }
          }
          valid = valid || EditMask.isDigit(strCharacter) ||
            (!isFirstChar && strCharacter == EditMask.DEFAULT_BLANK);
          break;
        }
      case EditMask.MASK_ASCII:
        {
          valid = EditMask.isDefined(strCharacter) || EditMask.isSpaceChar(strCharacter);
          break;
        }
      case EditMask.MASK_ASCIIOPT:
        {
          valid = EditMask.isDefined(strCharacter) || EditMask.isSpaceChar(strCharacter) ||
            (!isFirstChar && strCharacter == EditMask.DEFAULT_BLANK);
          break;
        }

      default:
        {
          // A character that is not a defined mask character.
          // The same character should exist in the string.
          valid = (strCharacter == maskCharacter);
        }
    }

    if (!valid)
      return null;

    stringBuffer += strCharacter;
  }

  // The string may be shorter than the mask string.
  // The string is valid if the remaining mask characters are optional.
  for (var j = maskIndex; j < maskLength; j++) {
    maskCharacter = mask.charAt(j);
    if (maskCharacter == EditMask.MASK_NUMERIC || maskCharacter == EditMask.MASK_ALPHA ||
      maskCharacter == EditMask.MASK_ALPHANUM || maskCharacter == EditMask.MASK_ASCII ||
      (maskCharacter == EditMask.MASK_DIR_LITERAL && ((j + 1) < maskLength)))
      return null;
  }

  return stringBuffer;
};
EditMask.isDigit = function (value) {
  if (value == null || value.length != 1)
    return false;

  var code = value.charCodeAt(0);
  return code >= 48 && code <= 57;
};
EditMask.isSpaceChar = function (value) {
  if (value == null || value.length != 1)
    return false;

  return value == ' ';
};
EditMask.isUpperCase = function (value) {
  if (value == null || value.length != 1)
    return false;

  var code = value.charCodeAt(0);
  return code >= 65 && code <= 90;
};
EditMask.isLowerCase = function (value) {
  if (value == null || value.length != 1)
    return false;

  var code = value.charCodeAt(0);
  return code >= 97 && code <= 122;
};
EditMask.isLetter = function (value) {
  return (EditMask.isLowerCase(value) || EditMask.isUpperCase(value));
};
EditMask.isDefined = function (string) {
  // Allow anything here
  return true;
};